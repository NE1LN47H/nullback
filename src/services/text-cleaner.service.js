/**
 * Text Cleaning Service
 *
 * Prepares raw extracted text from PDFs, Word documents, text, and markdown files
 * for downstream chunking, vector embedding, and retrieval in Nullback.
 *
 * Cleaning pipeline:
 * 1. Unicode Normalization (NFKC): Standardizes composite characters, ligatures, and symbols.
 * 2. Control Character Removal: Strips null bytes and non-printable control characters,
 *    protecting the database and vector pipeline while preserving valid whitespace (\t, \n, \r).
 * 3. Line-ending Normalization: Standardizes CRLF and CR to standard LF (\n).
 * 4. Horizontal Whitespace Normalization: Collapses excessive spaces and tabs per line.
 * 5. Paragraph Preservation: Collapses 3+ consecutive line breaks into 2 (\n\n) to retain
 *    clear paragraph boundaries for semantic chunking.
 * 6. Edge Trimming: Trims extraneous leading and trailing whitespace.
 */

export function cleanDocumentText(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return (
    text
      // 1. Normalize Unicode characters (NFKC format)
      .normalize("NFKC")
      // 2. Remove null bytes and non-printable control characters
      // Keeps tab (\x09) and newline (\x0A)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // 3. Normalize all line endings to Unix style (\n)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // 4. Collapse consecutive horizontal whitespace (spaces, tabs) into a single space
      .replace(/[^\S\n]+/g, " ")
      // 5. Trim each individual line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // 6. Collapse 3 or more consecutive newlines into 2 (preserves semantic paragraph breaks)
      .replace(/\n{3,}/g, "\n\n")
      // 7. Trim start and end of document
      .trim()
  );
}

