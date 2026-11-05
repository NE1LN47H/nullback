import Chunk from "@/models/Chunk";
import { ApiError } from "@/lib/api-error";
import mongoose from "mongoose";

const ATLAS_VECTOR_INDEX_NAME =
  process.env.ATLAS_VECTOR_INDEX_NAME || "vector_index";

/**
 * Calculates cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized text embeddings).
 *
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Cosine similarity score
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Returns the recommended MongoDB Atlas Vector Search index definition JSON.
 * Developers can use this in the Atlas UI (Atlas Search -> Create Index -> JSON Editor).
 */
export function getVectorIndexDefinition(
  dimensions = 1536,
  similarity = "cosine"
) {
  return {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: dimensions,
        similarity,
      },
      {
        type: "filter",
        path: "knowledgeBase",
      },
      {
        type: "filter",
        path: "owner",
      },
      {
        type: "filter",
        path: "document",
      },
    ],
  };
}

/**
 * Executes a vector similarity search across document chunks.
 *
 * Primary Strategy:
 * Uses MongoDB Atlas $vectorSearch aggregation stage with pre-filtering for
 * tenant isolation (owner + knowledgeBase + optional documentId / metadata).
 *
 * Fallback Strategy:
 * If $vectorSearch is not configured or in local development environments without an
 * active Atlas Search node, falls back to exact in-memory cosine similarity calculation
 * so local development and unit tests remain 100% operational.
 *
 * @param {object} params
 * @param {number[]} params.queryVector - The embedded query vector
 * @param {string} params.knowledgeBaseId - ID of KnowledgeBase to search within
 * @param {string} params.owner - User ID of owner for multi-tenant isolation
 * @param {number} [params.topK=5] - Number of top chunks to return
 * @param {string} [params.documentId] - Optional document-level filter
 * @param {object} [params.filters] - Optional custom metadata filters
 * @returns {Promise<Array<{ chunkId: string, documentId: string, content: string, score: number, metadata: object, chunkIndex: number }>>}
 */
export async function searchSimilarChunks({
  queryVector,
  knowledgeBaseId,
  owner,
  topK = 5,
  documentId = null,
  filters = {},
}) {
  if (!queryVector || !Array.isArray(queryVector) || queryVector.length === 0) {
    throw new ApiError(400, "Valid query vector is required for similarity search");
  }

  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  const kbObjectId = new mongoose.Types.ObjectId(knowledgeBaseId);
  const ownerObjectId = new mongoose.Types.ObjectId(owner);

  // Construct mandatory tenant-isolation filter
  const filterCriteria = {
    knowledgeBase: kbObjectId,
    owner: ownerObjectId,
  };

  // Optional document-level filtering
  if (documentId) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID filter");
    }
    filterCriteria.document = new mongoose.Types.ObjectId(documentId);
  }

  // Merge any user-provided metadata filters
  if (filters && typeof filters === "object") {
    for (const [key, value] of Object.entries(filters)) {
      if (key !== "knowledgeBase" && key !== "owner" && key !== "document") {
        filterCriteria[key.startsWith("metadata.") ? key : `metadata.${key}`] = value;
      }
    }
  }

  const limit = Math.max(1, Math.min(topK, 50));
  const numCandidates = Math.max(limit * 10, 50);

  // 1. Primary path: MongoDB Atlas $vectorSearch aggregation
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: ATLAS_VECTOR_INDEX_NAME,
          path: "embedding",
          queryVector,
          numCandidates,
          limit,
          filter: filterCriteria,
        },
      },
      {
        $project: {
          _id: 1,
          document: 1,
          knowledgeBase: 1,
          project: 1,
          owner: 1,
          chunkIndex: 1,
          content: 1,
          characterCount: 1,
          tokenCount: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const results = await Chunk.aggregate(pipeline);

    if (Array.isArray(results) && results.length > 0) {
      return results.map((r) => ({
        chunkId: r._id,
        documentId: r.document,
        content: r.content,
        score: Number(r.score ? r.score.toFixed(4) : 0),
        metadata: r.metadata || {},
        chunkIndex: r.chunkIndex,
        characterCount: r.characterCount,
        tokenCount: r.tokenCount,
      }));
    }
  } catch (atlasError) {
    // If $vectorSearch is not supported in current MongoDB environment (e.g. local DB without search index),
    // gracefully fall back to exact cosine calculation
    console.warn(
      "Atlas $vectorSearch not available or index unready, engaging exact cosine similarity fallback:",
      atlasError.message
    );
  }

  // 2. Resilient Fallback: Exact Cosine Similarity Calculation
  const chunks = await Chunk.find(filterCriteria)
    .select(
      "_id document knowledgeBase project owner chunkIndex content characterCount tokenCount metadata embedding"
    )
    .lean();

  if (!chunks || chunks.length === 0) {
    return [];
  }

  const scored = chunks
    .filter(
      (c) => Array.isArray(c.embedding) && c.embedding.length === queryVector.length
    )
    .map((c) => {
      const score = cosineSimilarity(queryVector, c.embedding);
      return {
        chunkId: c._id,
        documentId: c.document,
        content: c.content,
        score: Number(score.toFixed(4)),
        metadata: c.metadata || {},
        chunkIndex: c.chunkIndex,
        characterCount: c.characterCount,
        tokenCount: c.tokenCount,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

