import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12; // 96 bits recommended for GCM

// Development fallback key (strictly for local offline dev if env variable is unset)
const DEV_FALLBACK_KEY =
  "acd1326913273597475185f3907a78765261bd664ddf05cc9b7ad98961ebeca7";

/**
 * Resolves a 32-byte (256-bit) Buffer from the master encryption key environment variable.
 */
function getMasterKeyBuffer() {
  const masterKey =
    process.env.ENCRYPTION_MASTER_KEY || DEV_FALLBACK_KEY;

  if (masterKey.length === 64 && /^[0-9a-fA-F]+$/.test(masterKey)) {
    return Buffer.from(masterKey, "hex");
  }

  // Derive a deterministic 32-byte key via SHA-256 if arbitrary string is provided
  return crypto.createHash("sha256").update(masterKey).digest();
}

/**
 * Encrypts sensitive text (e.g. BYOK provider API keys) using authenticated AES-256-GCM.
 *
 * Output format: `<hex_iv>:<hex_auth_tag>:<hex_ciphertext>`
 *
 * @param {string} plaintext - Plaintext string to encrypt
 * @returns {string} Serialized encrypted payload
 */
export function encrypt(plaintext) {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("Encryption requires a non-empty string");
  }

  const key = getMasterKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts an authenticated AES-256-GCM payload.
 *
 * @param {string} payload - Serialized `<hex_iv>:<hex_auth_tag>:<hex_ciphertext>`
 * @returns {string} Decrypted plaintext
 */
export function decrypt(payload) {
  if (!payload || typeof payload !== "string") {
    throw new Error("Decryption requires a valid encrypted payload string");
  }

  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;

  const key = getMasterKeyBuffer();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      "Decryption failed: corrupted ciphertext or invalid master key"
    );
  }
}

/**
 * Masks an API key for safe presentation in dashboards, API responses, or logs.
 * Example: `sk-proj-1234567890abcdef` -> `sk-...cdef`
 *
 * @param {string} apiKey - The raw API key
 * @returns {string} Masked string (never exposes full secret)
 */
export function maskApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    return "****";
  }

  if (apiKey.length <= 8) {
    return "****";
  }

  const prefix = apiKey.slice(0, 3);
  const suffix = apiKey.slice(-4);
  return `${prefix}...${suffix}`;
}

