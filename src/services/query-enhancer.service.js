/**
 * Query Enhancement and Context Compression Service
 *
 * Implements:
 * 1. Conversational noise removal and keyword extraction
 * 2. Sentence-level relevance scoring
 * 3. Context compression (extracting the densest, most informative sentences)
 * 4. Relevance score calibration
 */

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
  "between", "both", "but", "by", "can", "cannot", "could", "did", "do", "does",
  "doing", "down", "during", "each", "few", "for", "from", "further", "had",
  "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
  "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself",
  "let", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off",
  "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
  "out", "over", "own", "same", "she", "should", "so", "some", "such", "than",
  "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "to", "too", "under", "until",
  "up", "very", "was", "we", "were", "what", "when", "where", "which", "while",
  "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself",
  "tell", "show", "please", "wondering", "find", "give"
]);

/**
 * Extracts high-signal search keywords from conversational user queries.
 * Strips conversational filler and common stop words.
 *
 * @param {string} query - Raw input query
 * @returns {string[]} Array of core keywords
 */
export function extractKeywords(query) {
  if (!query || typeof query !== "string") {
    return [];
  }

  const clean = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return clean.filter((w) => !STOP_WORDS.has(w) && w.length >= 2);
}

/**
 * Normalizes query string for improved vector and keyword matching.
 *
 * @param {string} query - Raw user query
 * @returns {string} Normalized query string
 */
export function normalizeQuery(query) {
  if (!query || typeof query !== "string") {
    return "";
  }

  return query
    .normalize("NFKC")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compresses a retrieved chunk's text into its most informative sentences
 * that directly match the user's query intent.
 *
 * @param {string} content - Full chunk content
 * @param {string[]} keywords - Extracted query keywords
 * @param {number} [maxSentences=3] - Maximum sentences to preserve
 * @returns {string} Compressed, information-dense snippet
 */
export function compressChunkContent(content, keywords, maxSentences = 3) {
  if (!content || !keywords || keywords.length === 0) {
    return content;
  }

  // Split content into sentences preserving punctuation
  const sentences = content
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length <= maxSentences) {
    return content;
  }

  // Score each sentence based on keyword frequency and density
  const scoredSentences = sentences.map((sentence, originalIndex) => {
    const lower = sentence.toLowerCase();
    let score = 0;

    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += 1;
        // Bonus for whole-word matches
        const wordRegex = new RegExp(`\\b${kw}\\b`, "i");
        if (wordRegex.test(sentence)) {
          score += 1;
        }
      }
    }

    return {
      sentence,
      originalIndex,
      score,
    };
  });

  // Pick top scoring sentences
  const topScored = [...scoredSentences]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences);

  // If no sentences matched keywords, return the first few sentences
  if (topScored.every((s) => s.score === 0)) {
    return sentences.slice(0, maxSentences).join(" ");
  }

  // Restore original chronological order of selected sentences
  topScored.sort((a, b) => a.originalIndex - b.originalIndex);

  return topScored.map((s) => s.sentence).join(" ");
}

/**
 * Decorates retrieval results with query keywords, optional context compression,
 * and calibrated percentage relevance scores.
 *
 * @param {Array} results - Raw chunks from search service
 * @param {string} query - Raw search query
 * @param {object} [options]
 * @param {boolean} [options.enableCompression=false] - Whether to generate compressed snippets
 * @returns {Array} Enhanced results
 */
export function enhanceRetrievalResults(
  results,
  query,
  { enableCompression = false } = {}
) {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return [];
  }

  const keywords = extractKeywords(query);

  return results.map((chunk) => {
    const base = { ...chunk };

    // Format human-friendly percentage relevance score
    base.relevanceScore = `${Math.round(chunk.score * 100)}%`;

    if (enableCompression && chunk.content) {
      const compressed = compressChunkContent(chunk.content, keywords, 3);
      base.compressedContent = compressed;
      base.compressionRatio = Number(
        (1 - compressed.length / chunk.content.length).toFixed(2)
      );
    }

    return base;
  });
}

