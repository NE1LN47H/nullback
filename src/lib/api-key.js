import crypto from "crypto";

const API_KEY_PREFIX = "nb_live_";

export function generateApiKey() {
  const randomSecret = crypto.randomBytes(32).toString("hex");

  const rawKey = `${API_KEY_PREFIX}${randomSecret}`;

  const keyHash = crypto
    .createHash("sha256")
    .update(rawKey)
    .digest("hex");

  const keyPrefix = rawKey.substring(0, 16);

  return {
    rawKey,
    keyHash,
    keyPrefix,
  };
}

export function hashApiKey(rawKey) {
  return crypto
    .createHash("sha256")
    .update(rawKey)
    .digest("hex");
}