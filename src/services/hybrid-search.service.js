import Chunk from "@/models/Chunk";
import { searchSimilarChunks } from "@/services/vector-search.service";
import { ApiError } from "@/lib/api-error";
import mongoose from "mongoose";

const RRF_K_CONSTANT = 60; // Standard ranking smoothing constant used in TREC and enterprise search
const DEFAULT_VECTOR_WEIGHT = 0.6;
const DEFAULT_KEYWORD_WEIGHT = 0.4;

/**
 * Executes a keyword-based lexical search against document chunks using MongoDB full-text search,
 * with tokenized regex matching fallback for exact strings, identifiers, and codes.
 *
 * @param {object} params
 * @param {string} params.query - Search query string
 * @param {string} params.knowledgeBaseId - Target knowledge base
 * @param {string} params.owner - User ID for tenant isolation
 * @param {number} [params.limit=20] - Candidate pool size
 * @param {string} [params.documentId] - Optional document filter
 * @param {object} [params.filters] - Optional custom metadata filters
 * @returns {Promise<Array<{ chunkId: string, documentId: string, content: string, score: number, metadata: object, chunkIndex: number }>>}
 */
export async function keywordSearchChunks({
  query,
  knowledgeBaseId,
  owner,
  limit = 20,
  documentId = null,
  filters = {},
}) {
  if (!query || typeof query !== "string") {
    return [];
  }

  const kbObjectId = new mongoose.Types.ObjectId(knowledgeBaseId);
  const ownerObjectId = new mongoose.Types.ObjectId(owner);

  const filterCriteria = {
    knowledgeBase: kbObjectId,
    owner: ownerObjectId,
  };

  if (documentId && mongoose.Types.ObjectId.isValid(documentId)) {
    filterCriteria.document = new mongoose.Types.ObjectId(documentId);
  }

  if (filters && typeof filters === "object") {
    for (const [key, value] of Object.entries(filters)) {
      if (key !== "knowledgeBase" && key !== "owner" && key !== "document") {
        filterCriteria[key.startsWith("metadata.") ? key : `metadata.${key}`] =
          value;
      }
    }
  }

  // 1. Primary path: MongoDB Full-Text Search ($text with textScore)
  try {
    const textResults = await Chunk.find(
      {
        ...filterCriteria,
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .select(
        "_id document knowledgeBase project owner chunkIndex content characterCount tokenCount metadata"
      )
      .lean();

    if (textResults && textResults.length > 0) {
      return textResults.map((r) => ({
        chunkId: r._id.toString(),
        documentId: r.document.toString(),
        content: r.content,
        score: Number(r.score ? r.score.toFixed(4) : 1),
        metadata: r.metadata || {},
        chunkIndex: r.chunkIndex,
        characterCount: r.characterCount,
        tokenCount: r.tokenCount,
      }));
    }
  } catch (textSearchError) {
    // If $text index is still building or query contains special syntax, fall through to regex
    console.warn("MongoDB $text search error:", textSearchError.message);
  }

  // 2. Fallback: Tokenized substring regex matching (ideal for part numbers, codes, and exact words)
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (tokens.length === 0) {
    return [];
  }

  const regexPattern = new RegExp(tokens.join("|"), "i");

  const regexResults = await Chunk.find({
    ...filterCriteria,
    content: { $regex: regexPattern },
  })
    .limit(limit)
    .select(
      "_id document knowledgeBase project owner chunkIndex content characterCount tokenCount metadata"
    )
    .lean();

  return regexResults.map((r, index) => ({
    chunkId: r._id.toString(),
    documentId: r.document.toString(),
    content: r.content,
    score: Number((1 / (index + 1)).toFixed(4)),
    metadata: r.metadata || {},
    chunkIndex: r.chunkIndex,
    characterCount: r.characterCount,
    tokenCount: r.tokenCount,
  }));
}

/**
 * Merges and re-ranks vector and keyword search candidates using Reciprocal Rank Fusion (RRF).
 *
 * Formula:
 * RRF Score = (vectorWeight / (k + vectorRank)) + (keywordWeight / (k + keywordRank))
 * Normalized to 0.0 - 1.0 range.
 */
export function reciprocalRankFusion(
  vectorResults = [],
  keywordResults = [],
  {
    k = RRF_K_CONSTANT,
    vectorWeight = DEFAULT_VECTOR_WEIGHT,
    keywordWeight = DEFAULT_KEYWORD_WEIGHT,
  } = {}
) {
  const candidateMap = new Map();

  // Theoretical max score for normalization (when item is ranked #1 in both channels)
  const maxPossibleScore = (vectorWeight + keywordWeight) / (k + 1);

  // 1. Score vector results
  vectorResults.forEach((chunk, index) => {
    const id = chunk.chunkId.toString();
    const rank = index + 1;
    const rrfContribution = vectorWeight / (k + rank);

    candidateMap.set(id, {
      ...chunk,
      rrfRawScore: rrfContribution,
      vectorRank: rank,
      keywordRank: null,
      vectorScore: chunk.score,
    });
  });

  // 2. Merge keyword results
  keywordResults.forEach((chunk, index) => {
    const id = chunk.chunkId.toString();
    const rank = index + 1;
    const rrfContribution = keywordWeight / (k + rank);

    if (candidateMap.has(id)) {
      const existing = candidateMap.get(id);
      existing.rrfRawScore += rrfContribution;
      existing.keywordRank = rank;
      existing.keywordScore = chunk.score;
    } else {
      candidateMap.set(id, {
        ...chunk,
        rrfRawScore: rrfContribution,
        vectorRank: null,
        keywordRank: rank,
        keywordScore: chunk.score,
      });
    }
  });

  // 3. Sort descending by combined RRF score and normalize to 0.0 - 1.0
  const fused = Array.from(candidateMap.values())
    .sort((a, b) => b.rrfRawScore - a.rrfRawScore)
    .map((item) => {
      const normalizedScore = Math.min(
        1,
        Number((item.rrfRawScore / maxPossibleScore).toFixed(4))
      );

      return {
        chunkId: item.chunkId,
        documentId: item.documentId,
        content: item.content,
        score: normalizedScore,
        metadata: item.metadata,
        chunkIndex: item.chunkIndex,
        characterCount: item.characterCount,
        tokenCount: item.tokenCount,
        diagnostics: {
          vectorRank: item.vectorRank,
          keywordRank: item.keywordRank,
          searchChannel:
            item.vectorRank && item.keywordRank
              ? "hybrid_match"
              : item.vectorRank
              ? "vector_only"
              : "keyword_only",
        },
      };
    });

  return fused;
}

/**
 * Orchestrates Hybrid Search: executes Dense Vector Search and Sparse Keyword Search in parallel,
 * then fuses them with Reciprocal Rank Fusion.
 *
 * @param {object} params
 * @returns {Promise<Array>} Ranked top-K fused chunks
 */
export async function performHybridSearch({
  query,
  queryVector,
  knowledgeBaseId,
  owner,
  topK = 5,
  documentId = null,
  filters = {},
  vectorWeight = DEFAULT_VECTOR_WEIGHT,
  keywordWeight = DEFAULT_KEYWORD_WEIGHT,
}) {
  const candidatePoolSize = Math.max(topK * 4, 20);

  // Run Vector search and Keyword search simultaneously
  const [vectorResults, keywordResults] = await Promise.all([
    searchSimilarChunks({
      queryVector,
      knowledgeBaseId,
      owner,
      topK: candidatePoolSize,
      documentId,
      filters,
    }),
    keywordSearchChunks({
      query,
      knowledgeBaseId,
      owner,
      limit: candidatePoolSize,
      documentId,
      filters,
    }),
  ]);

  // Fuse candidates using RRF
  const fusedResults = reciprocalRankFusion(vectorResults, keywordResults, {
    vectorWeight,
    keywordWeight,
  });

  return fusedResults.slice(0, topK);
}

