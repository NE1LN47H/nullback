import mongoose from "mongoose";
import { ApiError } from "@/lib/api-error";
import ApiKey from "@/models/ApiKey";
import { generateApiKey } from "@/lib/api-key";

export async function createApiKey({ name, owner }) {
  // Generate a secure API key
  const { rawKey, keyHash, keyPrefix } = generateApiKey();

  // Save only the hash in MongoDB
  const apiKey = await ApiKey.create({
    name,
    keyHash,
    keyPrefix,
    owner,
  });

  // Return the raw key only once
  return {
    id: apiKey._id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    status: apiKey.status,
    createdAt: apiKey.createdAt,
    key: rawKey,
  };
}

export async function getUserApiKeys(userId) {
  const apiKeys = await ApiKey.find({ owner: userId })
    .sort({ createdAt: -1 })
    .select("name keyPrefix status lastUsedAt createdAt");

  return apiKeys.map((apiKey) => ({
    id: apiKey._id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    status: apiKey.status,
    lastUsedAt: apiKey.lastUsedAt,
    createdAt: apiKey.createdAt,
  }));
}

export async function revokeApiKey(apiKeyId, userId) {
  if (!mongoose.Types.ObjectId.isValid(apiKeyId)) {
    throw new ApiError(400, "Invalid API key ID");
  }

  const apiKey = await ApiKey.findOneAndUpdate(
    {
      _id: apiKeyId,
      owner: userId,
      status: "active",
    },
    {
      $set: { status: "revoked" },
    },
    {
      new: true,
    }
  ).select("name keyPrefix status createdAt");

  if (!apiKey) {
    throw new ApiError(404, "Active API key not found");
  }

  return {
    id: apiKey._id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    status: apiKey.status,
    createdAt: apiKey.createdAt,
  };
}