import { retrieveContext } from "@/services/retrieval.service";
import { recordRequestLog } from "@/services/analytics.service";
import { successResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { handleError } from "@/lib/handle-error";

/**
 * Controller for POST /api/v1/retrieve
 * Parses parameters, delegates to retrieval service, records analytics, and formats JSON response.
 */
export async function retrieveController(request, authUser) {
  const reqStart = performance.now();
  let parsedKnowledgeBaseId = null;
  let parsedQuery = null;

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON request body");
    }

    const {
      knowledgeBaseId,
      query,
      topK,
      mode = "hybrid",
      compress = false,
      documentId,
      filters,
    } = body || {};

    parsedKnowledgeBaseId = knowledgeBaseId;
    parsedQuery = query;

    if (!knowledgeBaseId) {
      throw new ApiError(400, "Knowledge base ID is required");
    }

    if (!query) {
      throw new ApiError(400, "Query string is required");
    }

    const parsedTopK = topK ? parseInt(topK, 10) : 5;
    if (isNaN(parsedTopK) || parsedTopK < 1 || parsedTopK > 50) {
      throw new ApiError(400, "topK must be an integer between 1 and 50");
    }

    const selectedMode = mode === "vector" ? "vector" : "hybrid";

    const data = await retrieveContext({
      query,
      knowledgeBaseId,
      owner: authUser.userId,
      topK: parsedTopK,
      mode: selectedMode,
      compress: Boolean(compress),
      documentId,
      filters,
    });

    // Record non-blocking request log
    recordRequestLog({
      owner: authUser.userId,
      knowledgeBase: knowledgeBaseId,
      apiKey: authUser.apiKeyId || null,
      endpoint: "/api/v1/retrieve",
      method: "POST",
      statusCode: 200,
      latencyMs: data.latencyMs,
      query,
      resultsCount: data.totalResults,
    });

    return successResponse(data, "Retrieval successful");
  } catch (error) {
    const elapsed = Math.round(performance.now() - reqStart);
    recordRequestLog({
      owner: authUser.userId,
      knowledgeBase: parsedKnowledgeBaseId,
      apiKey: authUser.apiKeyId || null,
      endpoint: "/api/v1/retrieve",
      method: "POST",
      statusCode: error.statusCode || 500,
      latencyMs: elapsed,
      query: parsedQuery,
      errorMessage: error.message,
    });

    return handleError(error);
  }
}
