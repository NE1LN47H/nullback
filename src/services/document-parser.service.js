import mammoth from "mammoth";
import { readFile } from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import { ApiError } from "@/lib/api-error";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Parser security and resource thresholds
const MAX_PAGES = 500;
const MAX_CHARACTERS = 5_000_000; // 5M characters (~1.25M tokens)
const PARSER_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Executes an async operation with a strict timeout to prevent parser hangs.
 */
function withTimeout(promise, timeoutMs, errorMessage) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new ApiError(408, errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Extracts raw text from stored document files with strict resource limits and timeouts.
 *
 * @param {string} storageKey - Key of stored file
 * @param {string} mimeType - MIME type of document
 * @returns {Promise<{ text: string, pageCount: number | null }>}
 */
export async function extractDocumentText(storageKey, mimeType) {
  const safeName = path.basename(storageKey);

  if (safeName !== storageKey) {
    throw new ApiError(400, "Invalid storage key");
  }

  const filePath = path.join(UPLOAD_DIR, safeName);
  const buffer = await readFile(filePath);

  let extractedText = "";
  let pageCount = null;

  // 1. PDF extraction
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await withTimeout(
        parser.getText(),
        PARSER_TIMEOUT_MS,
        "PDF text extraction timed out (exceeded 30 seconds)"
      );

      if (result.total > MAX_PAGES) {
        throw new ApiError(
          400,
          `PDF exceeds maximum limit of ${MAX_PAGES} pages (found ${result.total} pages)`
        );
      }

      extractedText = result.text || "";
      pageCount = result.total || null;
    } finally {
      await parser.destroy();
    }
  }

  // 2. DOCX extraction
  else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await withTimeout(
      mammoth.extractRawText({ buffer }),
      PARSER_TIMEOUT_MS,
      "DOCX text extraction timed out (exceeded 30 seconds)"
    );

    extractedText = result.value || "";
    pageCount = null;
  }

  // 3. Plain Text and Markdown extraction
  else if (mimeType === "text/plain" || mimeType === "text/markdown") {
    extractedText = buffer.toString("utf-8");
    pageCount = null;
  } else {
    throw new ApiError(400, "Unsupported document format");
  }

  // 4. Maximum character limit guard
  if (extractedText.length > MAX_CHARACTERS) {
    throw new ApiError(
      400,
      `Extracted text exceeds maximum limit of ${MAX_CHARACTERS.toLocaleString()} characters`
    );
  }

  return {
    text: extractedText,
    pageCount,
  };
}
