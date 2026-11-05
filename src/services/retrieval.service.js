import KnowledgeBase from "@/models/KnowledgeBase";
import EmbeddingConfig from "@/models/EmbeddingConfig";
import { generateSingleEmbedding } from "@/services/embedding.service";
import { searchSimilarChunks } from "@/services/vector-search.service";
import { performHybridSearch } from "@/services/hybrid-search.service";
import { enhanceRetrievalResults } from "@/services/query-enhancer.service";
import { ApiError } from "@/lib/api-error";
import mongoose from "mongoose";

/**
 * Executes the full end-to-end RAG retrieval pipeline:
 * 1. Validates query and knowledge base ownership
 * 2. Resolves the active embedding profile
 * 3. Generates high-dimensional vector for the user query
 * 4. Executes Hybrid Search (Vector + BM25 Lexical + RRF) or pure Vector Search
 * 5. Enhances results with relevance calibration and optional context compression
 * 6. Measures and reports retrieval latency
 *
 * @param {object} params
 * @param {string} params.query - The user's search query
 * @param {string} params.knowledgeBaseId - Target knowledge base ID
 * @param {string} params.owner - Authenticated user ID (tenant isolation)
 * @param {number} [params.topK=5] - Maximum number of relevant chunks to retrieve
 * @param {string} [params.mode="hybrid"] - Retrieval mode: "hybrid" or "vector"
 * @param {boolean} [params.compress=false] - Whether to include compressed snippet passages
 * @param {string} [params.documentId] - Optional filter for a specific document
 * @param {object} [params.filters] - Optional custom metadata filters
 * @returns {Promise<{ query: string, mode: string, results: Array, totalResults: number, latencyMs: number, knowledgeBaseId: string }>}
 */
export async function retrieveContext({
  query,
  knowledgeBaseId,
  owner,
  topK = 5,
  mode = "hybrid",
  compress = false,
  documentId = null,
  filters = {},
}) {
  if (!query || typeof query !== "string" || !query.trim()) {
    throw new ApiError(400, "Query string is required");
  }

  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  const startTime = performance.now();

  // 1. Verify knowledge base exists and belongs to the authenticated user
  const knowledgeBase = await KnowledgeBase.findOne({
    _id: knowledgeBaseId,
    owner,
  });

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  // 2. Resolve embedding configuration
  let embeddingConfig = null;

  if (knowledgeBase.embeddingConfig) {
    embeddingConfig = await EmbeddingConfig.findOne({
      _id: knowledgeBase.embeddingConfig,
      owner,
    });
  }

  if (!embeddingConfig) {
    embeddingConfig = await EmbeddingConfig.findOne({
      project: knowledgeBase.project,
      owner,
      isDefault: true,
    });
  }

  if (!embeddingConfig) {
    throw new ApiError(
      400,
      "No embedding configuration found. Please attach an embedding profile to this knowledge base or configure a project default."
    );
  }

  // 3. Generate vector representation of the search query
  const queryVector = await generateSingleEmbedding(
    query.trim(),
    embeddingConfig
  );

  // 4. Perform Search (Hybrid or Pure Vector)
  let rawResults;

  if (mode === "vector") {
    rawResults = await searchSimilarChunks({
      queryVector,
      knowledgeBaseId: knowledgeBase._id.toString(),
      owner,
      topK,
      documentId,
      filters,
    });
  } else {
    // Default: State-of-the-art Hybrid Search with Reciprocal Rank Fusion
    rawResults = await performHybridSearch({
      query: query.trim(),
      queryVector,
      knowledgeBaseId: knowledgeBase._id.toString(),
      owner,
      topK,
      documentId,
      filters,
    });
  }

  // 5. Enhance results with calibrated relevance scoring and optional context compression
  const enhancedResults = enhanceRetrievalResults(rawResults, query, {
    enableCompression: Boolean(compress),
  });

  const latencyMs = Math.round(performance.now() - startTime);

  return {
    query: query.trim(),
    mode,
    results: enhancedResults,
    totalResults: enhancedResults.length,
    latencyMs,
    knowledgeBaseId: knowledgeBase._id.toString(),
  };
}
