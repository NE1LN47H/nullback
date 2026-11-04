import crypto from "crypto";
import ApiKey from "@/models/ApiKey";
import { ApiError } from "@/lib/api-error";

export async function authenticateApiKey(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(401, "API key is required");
  }

  const rawKey = authorization.slice(7).trim();

  if (!rawKey.startsWith("nb_live_")) {
    throw new ApiError(401, "Invalid API key");
  }

  const keyHash = crypto
    .createHash("sha256")
    .update(rawKey)
    .digest("hex");

  const apiKey = await ApiKey.findOne({
    keyHash,
    status: "active",
  });

  if (!apiKey) {
    throw new ApiError(401, "Invalid or revoked API key");
  }

  // Update the last-used timestamp
  await ApiKey.updateOne(
    { _id: apiKey._id },
    { $set: { lastUsedAt: new Date() } }
  );

  return {
    apiKeyId: apiKey._id.toString(),
    userId: apiKey.owner.toString(),
  };
}