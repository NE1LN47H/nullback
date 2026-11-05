import { ApiError } from "@/lib/api-error";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
};

// Known binary signatures (magic bytes)
const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP container)
};

// Dangerous executable signatures to guard against disguised binaries
const DANGEROUS_SIGNATURES = [
  [0x4d, 0x5a], // Windows EXE / DLL (MZ)
  [0x7f, 0x45, 0x4c, 0x46], // Linux ELF binary
  [0xca, 0xfe, 0xba, 0xbe], // Mach-O / Java class
  [0xcf, 0xfa, 0xed, 0xfe], // Mach-O 64-bit binary
];

function matchesSignature(buffer, signature) {
  if (buffer.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

/**
 * Validates document upload constraints:
 * - File existence and non-zero length
 * - Maximum file size limit (10 MB)
 * - File extension and MIME type allowlist
 * - Binary magic byte verification to prevent file extension spoofing
 * - Executable signature rejection
 *
 * @param {File} file - Web File object from multipart/form-data
 * @param {Buffer} [buffer] - Optional binary buffer for deep magic byte inspection
 */
export function validateDocument(file, buffer = null) {
  if (!file) {
    throw new ApiError(400, "Document file is required");
  }

  if (file.size === 0) {
    throw new ApiError(400, "Document file is empty");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, "Maximum document size is 10 MB");
  }

  const extension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  const allowedExtensions = ALLOWED_MIME_TYPES[file.type];

  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    throw new ApiError(
      400,
      "Only PDF, DOCX, TXT and Markdown files are supported"
    );
  }

  // Deep binary inspection if buffer is available
  if (buffer && Buffer.isBuffer(buffer)) {
    // 1. Guard against disguised executable binaries
    for (const signature of DANGEROUS_SIGNATURES) {
      if (matchesSignature(buffer, signature)) {
        throw new ApiError(
          400,
          "Invalid file: executable binaries are not permitted"
        );
      }
    }

    // 2. Validate PDF signature (%PDF)
    if (file.type === "application/pdf") {
      if (!matchesSignature(buffer, FILE_SIGNATURES.pdf)) {
        throw new ApiError(
          400,
          "Corrupted or spoofed PDF file (invalid file header signature)"
        );
      }
    }

    // 3. Validate DOCX signature (PK ZIP container)
    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      if (!matchesSignature(buffer, FILE_SIGNATURES.docx)) {
        throw new ApiError(
          400,
          "Corrupted or spoofed DOCX file (invalid file header signature)"
        );
      }
    }
  }

  return true;
}
