import { decrypt } from "@/lib/encryption";
import { ApiError } from "@/lib/api-error";
import EmbeddingConfig from "@/models/EmbeddingConfig";

const BATCH_SIZE = 32; // Optimal batch size for throughput while respecting request limits
const MAX_RETRIES = 3;

/**
 * Executes an HTTP fetch with automatic exponential backoff for rate limits (429) and transient errors.
 */
async function fetchWithRetry(url, options, maxRetries = MAX_RETRIES) {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    try {
      const response = await fetch(url, options);

      // Handle Rate Limits (429) or transient server errors (500, 502, 503, 504)
      if (
        response.status === 429 ||
        (response.status >= 500 && response.status <= 504)
      ) {
        const errorText = await response.text().catch(() => "");

        if (attempt < maxRetries) {
          // Exponential backoff: (2^attempt * 500ms) + random jitter (0-200ms)
          const backoff =
            Math.pow(2, attempt) * 500 + Math.floor(Math.random() * 200);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        throw new ApiError(
          502,
          `Embedding provider rate limit or server error (${response.status}): ${errorText.slice(0, 300)}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new ApiError(
          response.status >= 400 && response.status < 500 ? 400 : 502,
          `Embedding provider returned error (${response.status}): ${errorText.slice(0, 300)}`
        );
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      if (attempt >= maxRetries) {
        throw new ApiError(
          502,
          `Network error communicating with embedding provider: ${err.message}`
        );
      }

      const backoff =
        Math.pow(2, attempt) * 500 + Math.floor(Math.random() * 200);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}

/**
 * Provider-specific adapter: calls OpenAI or OpenAI-compatible custom endpoints.
 */
async function callOpenAICompatible({
  apiKey,
  model,
  texts,
  baseUrl = "https://api.openai.com/v1",
}) {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/embeddings`;

  const payload = {
    model,
    input: texts,
    encoding_format: "float",
  };

  const data = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!data || !Array.isArray(data.data)) {
    throw new ApiError(502, "Invalid response structure from embedding provider");
  }

  // Sort by index to guarantee vectors match input text order
  const sorted = [...data.data].sort((a, b) => a.index - b.index);
  const vectors = sorted.map((item) => item.embedding);
  const tokens = data.usage?.total_tokens || 0;

  return { vectors, tokens };
}

/**
 * Provider-specific adapter: calls Voyage AI.
 */
async function callVoyage({ apiKey, model, texts, baseUrl = "https://api.voyageai.com/v1" }) {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/embeddings`;

  const data = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
    }),
  });

  if (!data || !Array.isArray(data.data)) {
    throw new ApiError(502, "Invalid response structure from Voyage AI");
  }

  const sorted = [...data.data].sort((a, b) => a.index - b.index);
  const vectors = sorted.map((item) => item.embedding);
  const tokens = data.usage?.total_tokens || 0;

  return { vectors, tokens };
}

/**
 * Provider-specific adapter: calls Cohere v2 embed API.
 */
async function callCohere({ apiKey, model, texts, baseUrl = "https://api.cohere.com/v2" }) {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/embed`;

  const data = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      texts,
      input_type: "search_document",
      embedding_types: ["float"],
    }),
  });

  const vectors = data.embeddings?.float || [];
  const tokens = data.meta?.billed_units?.input_tokens || 0;

  return { vectors, tokens };
}

/**
 * Dispatches a batch of texts to the appropriate embedding provider.
 */
async function dispatchEmbeddingRequest(provider, { apiKey, model, texts, baseUrl }) {
  switch (provider) {
    case "openai":
    case "custom":
      return callOpenAICompatible({ apiKey, model, texts, baseUrl });
    case "voyage":
      return callVoyage({ apiKey, model, texts, baseUrl });
    case "cohere":
      return callCohere({ apiKey, model, texts, baseUrl });
    default:
      throw new ApiError(400, `Unsupported embedding provider: ${provider}`);
  }
}

/**
 * Generates vector embeddings for an array of text strings using the developer's BYOK credentials.
 *
 * Handles:
 * - Decryption of stored credentials
 * - Automatic batching (32 items per batch)
 * - Rate limit retries with exponential backoff
 * - Strict vector dimension validation against the configuration contract
 * - Usage analytics tracking (tokens and requests)
 *
 * @param {string[]} texts - Array of text passages to embed
 * @param {object} config - EmbeddingConfig instance or configuration object
 * @returns {Promise<{ embeddings: number[][], totalTokens: number, dimensions: number }>}
 */
export async function generateEmbeddings(texts, config) {
  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return { embeddings: [], totalTokens: 0, dimensions: config.dimensions };
  }

  if (!config) {
    throw new ApiError(400, "Embedding configuration is required");
  }

  // 1. Resolve and decrypt the developer's API key
  let encryptedKey = config.encryptedApiKey;

  // If config is a Mongoose document where encryptedApiKey was excluded via select: false, fetch it
  if (!encryptedKey && config._id) {
    const fullConfig = await EmbeddingConfig.findById(config._id).select(
      "+encryptedApiKey"
    );
    if (!fullConfig || !fullConfig.encryptedApiKey) {
      throw new ApiError(404, "Embedding credentials not found");
    }
    encryptedKey = fullConfig.encryptedApiKey;
  }

  if (!encryptedKey) {
    throw new ApiError(400, "No embedding API credentials provided");
  }

  const decryptedApiKey = decrypt(encryptedKey);

  // 2. Process in batches
  const allVectors = [];
  let totalTokens = 0;

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const { vectors, tokens } = await dispatchEmbeddingRequest(config.provider, {
      apiKey: decryptedApiKey,
      model: config.model,
      texts: batch,
      baseUrl: config.baseUrl,
    });

    // 3. Strict dimension validation: verify vector length against config contract
    for (let j = 0; j < vectors.length; j++) {
      const vec = vectors[j];
      if (!Array.isArray(vec) || vec.length !== config.dimensions) {
        throw new ApiError(
          502,
          `Embedding dimension mismatch: provider returned ${vec ? vec.length : 0} dimensions, but this configuration requires exactly ${config.dimensions} dimensions.`
        );
      }
    }

    allVectors.push(...vectors);
    totalTokens += tokens;
  }

  // 4. Update usage analytics if config is stored in DB
  if (config._id && totalTokens > 0) {
    await EmbeddingConfig.updateOne(
      { _id: config._id },
      {
        $inc: {
          "usage.totalTokens": totalTokens,
          "usage.totalRequests": 1,
        },
        $set: {
          "usage.lastUsedAt": new Date(),
        },
      }
    ).catch((err) => {
      console.warn("Failed to update embedding usage analytics:", err.message);
    });
  }

  return {
    embeddings: allVectors,
    totalTokens,
    dimensions: config.dimensions,
  };
}

/**
 * Generates an embedding for a single text query (e.g. during retrieval).
 *
 * @param {string} text - The query text to embed
 * @param {object} config - Embedding configuration
 * @returns {Promise<number[]>} High-dimensional vector array
 */
export async function generateSingleEmbedding(text, config) {
  if (!text || typeof text !== "string") {
    throw new ApiError(400, "Query text is required for embedding generation");
  }

  const result = await generateEmbeddings([text], config);

  if (!result.embeddings || result.embeddings.length === 0) {
    throw new ApiError(502, "Failed to generate query embedding");
  }

  return result.embeddings[0];
}

