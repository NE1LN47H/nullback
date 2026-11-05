/**
 * Intelligent Chunking Service for Nullback RAG
 *
 * Implements recursive character text splitting with semantic hierarchy preservation:
 * 1. Double line breaks (\n\n) -> Preserves paragraphs and sections
 * 2. Single line breaks (\n)   -> Preserves list items and sentences
 * 3. Sentence boundaries (. )  -> Preserves sentence-level semantics
 * 4. Word boundaries (spaces)  -> Avoids mid-word truncations
 * 5. Character fallback        -> Handles extremely long uninterrupted tokens
 *
 * Features:
 * - Configurable chunk size and overlap
 * - Sliding window overlap retention for context preservation
 * - Fast token estimation (~4 chars/token heuristic weighted by word count)
 */

const DEFAULT_CHUNK_SIZE = 1000; // characters (~250 tokens)
const DEFAULT_CHUNK_OVERLAP = 200; // characters (~50 tokens)
const DEFAULT_SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", "; ", " ", ""];

/**
 * Estimates the token count of a given text string.
 * Uses a weighted heuristic (~4 characters per token in English, cross-referenced with word count).
 *
 * @param {string} text - The input text
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(text) {
  if (!text || typeof text !== "string") {
    return 0;
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }

  const words = trimmed.split(/\s+/).length;
  const charTokens = Math.ceil(trimmed.length / 4);
  const wordTokens = Math.ceil(words * 1.3);

  return Math.max(charTokens, wordTokens);
}

/**
 * Recursively splits text into segments smaller than chunkSize using a hierarchy of separators.
 */
function splitTextRecursively(text, separators, chunkSize) {
  if (text.length <= chunkSize) {
    return [text];
  }

  // Find the first separator present in the text
  let chosenSeparator = "";
  let separatorIndex = separators.length;

  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i];
    if (sep === "" || text.includes(sep)) {
      chosenSeparator = sep;
      separatorIndex = i;
      break;
    }
  }

  const remainingSeparators = separators.slice(separatorIndex + 1);

  // Split text by chosen separator
  const rawSplits =
    chosenSeparator === ""
      ? Array.from(text)
      : text.split(chosenSeparator);

  const goodSplits = [];

  for (const split of rawSplits) {
    if (!split) continue;

    if (split.length <= chunkSize) {
      goodSplits.push(split);
    } else if (remainingSeparators.length > 0) {
      const subSplits = splitTextRecursively(
        split,
        remainingSeparators,
        chunkSize
      );
      goodSplits.push(...subSplits);
    } else {
      // Hard chunk fallback when no separators remain
      for (let i = 0; i < split.length; i += chunkSize) {
        goodSplits.push(split.slice(i, i + chunkSize));
      }
    }
  }

  return goodSplits;
}

/**
 * Splits document text into ordered, overlapping chunks for embedding and vector storage.
 *
 * @param {string} text - Cleaned document text
 * @param {object} [options] - Chunking configuration
 * @param {number} [options.chunkSize=1000] - Target maximum characters per chunk
 * @param {number} [options.chunkOverlap=200] - Number of characters to overlap between adjacent chunks
 * @returns {Array<{ chunkIndex: number, content: string, characterCount: number, tokenCount: number }>}
 */
export function chunkDocumentText(text, options = {}) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return [];
  }

  const chunkSize =
    typeof options.chunkSize === "number" && options.chunkSize > 0
      ? options.chunkSize
      : DEFAULT_CHUNK_SIZE;

  const rawOverlap =
    typeof options.chunkOverlap === "number" && options.chunkOverlap >= 0
      ? options.chunkOverlap
      : DEFAULT_CHUNK_OVERLAP;

  // Overlap must be strictly less than chunk size
  const chunkOverlap = Math.min(rawOverlap, Math.floor(chunkSize / 2));

  // If text already fits in one chunk, return it immediately
  if (trimmedText.length <= chunkSize) {
    return [
      {
        chunkIndex: 0,
        content: trimmedText,
        characterCount: trimmedText.length,
        tokenCount: estimateTokenCount(trimmedText),
      },
    ];
  }

  // Break text down into atomic segments using semantic separators
  const splits = splitTextRecursively(
    trimmedText,
    DEFAULT_SEPARATORS,
    chunkSize
  );

  const chunks = [];
  let currentAccumulator = [];
  let currentAccumulatorLength = 0;

  for (let i = 0; i < splits.length; i++) {
    const split = splits[i];
    const neededSpacing = currentAccumulator.length > 0 ? 1 : 0;
    const prospectiveLength =
      currentAccumulatorLength + neededSpacing + split.length;

    if (prospectiveLength <= chunkSize) {
      currentAccumulator.push(split);
      currentAccumulatorLength += neededSpacing + split.length;
    } else {
      if (currentAccumulator.length > 0) {
        const chunkText = currentAccumulator.join(" ").trim();
        if (chunkText.length > 0) {
          chunks.push(chunkText);
        }

        // Apply sliding-window overlap: retain splits from the end of current chunk
        // whose total length fits within chunkOverlap
        const overlapSplits = [];
        let overlapLength = 0;

        for (let j = currentAccumulator.length - 1; j >= 0; j--) {
          const prevSplit = currentAccumulator[j];
          const splitLengthWithSpace = prevSplit.length + (overlapSplits.length > 0 ? 1 : 0);

          if (overlapLength + splitLengthWithSpace <= chunkOverlap) {
            overlapSplits.unshift(prevSplit);
            overlapLength += splitLengthWithSpace;
          } else {
            break;
          }
        }

        currentAccumulator = overlapSplits;
        currentAccumulatorLength = overlapLength;
      }

      currentAccumulator.push(split);
      currentAccumulatorLength += (currentAccumulator.length > 1 ? 1 : 0) + split.length;
    }
  }

  if (currentAccumulator.length > 0) {
    const finalChunkText = currentAccumulator.join(" ").trim();
    if (finalChunkText.length > 0) {
      chunks.push(finalChunkText);
    }
  }

  // Format into chunk objects with index and counts
  return chunks.map((content, index) => ({
    chunkIndex: index,
    content,
    characterCount: content.length,
    tokenCount: estimateTokenCount(content),
  }));
}

