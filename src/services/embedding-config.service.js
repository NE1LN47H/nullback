import EmbeddingConfig from "@/models/EmbeddingConfig";
import Project from "@/models/Project";
import KnowledgeBase from "@/models/KnowledgeBase";
import { encrypt, maskApiKey } from "@/lib/encryption";
import { validateCustomEndpointUrl } from "@/validators/url.validator";
import { ApiError } from "@/lib/api-error";
import mongoose from "mongoose";

// Standard model-to-dimension mappings for convenience
const DEFAULT_DIMENSIONS = {
  openai: {
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072,
    "text-embedding-ada-002": 1536,
  },
  voyage: {
    "voyage-3": 1024,
    "voyage-3-lite": 512,
    "voyage-code-3": 1024,
    "voyage-large-2": 1536,
  },
  cohere: {
    "embed-english-v3.0": 1024,
    "embed-multilingual-v3.0": 1024,
    "embed-english-light-v3.0": 384,
  },
};

/**
 * Creates and registers a new BYOK embedding configuration.
 * Encrypts API keys using AES-256-GCM and validates custom URLs for SSRF.
 */
export async function createEmbeddingConfig({
  name,
  provider = "openai",
  model = "text-embedding-3-small",
  dimensions,
  apiKey,
  baseUrl = null,
  projectId,
  isDefault = false,
  owner,
}) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Configuration name is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  // 1. Verify project ownership
  const project = await Project.findOne({ _id: projectId, owner });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new ApiError(400, "API key is required");
  }

  // 2. Validate provider
  const validProviders = ["openai", "voyage", "cohere", "custom"];
  if (!validProviders.includes(provider)) {
    throw new ApiError(
      400,
      `Invalid provider: must be one of ${validProviders.join(", ")}`
    );
  }

  // 3. Resolve and validate dimension count
  let resolvedDimensions = dimensions;
  if (!resolvedDimensions) {
    resolvedDimensions = DEFAULT_DIMENSIONS[provider]?.[model] || 1536;
  }

  if (
    typeof resolvedDimensions !== "number" ||
    resolvedDimensions < 1 ||
    resolvedDimensions > 4096
  ) {
    throw new ApiError(
      400,
      "Embedding dimensions must be a number between 1 and 4096"
    );
  }

  // 4. Validate custom baseUrl against SSRF
  let sanitizedBaseUrl = null;
  if (baseUrl) {
    sanitizedBaseUrl = validateCustomEndpointUrl(baseUrl);
  }

  // 5. Encrypt API key with AES-256-GCM and compute mask
  const encryptedApiKey = encrypt(apiKey.trim());
  const masked = maskApiKey(apiKey.trim());

  // 6. Demote existing defaults if this config is marked default
  if (isDefault) {
    await EmbeddingConfig.updateMany(
      { project: projectId, owner, isDefault: true },
      { $set: { isDefault: false } }
    );
  }

  const config = await EmbeddingConfig.create({
    name: name.trim(),
    provider,
    model: model.trim(),
    dimensions: resolvedDimensions,
    encryptedApiKey,
    maskedApiKey: masked,
    baseUrl: sanitizedBaseUrl,
    project: projectId,
    owner,
    isDefault,
  });

  return {
    id: config._id,
    name: config.name,
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    maskedApiKey: config.maskedApiKey,
    baseUrl: config.baseUrl,
    project: config.project,
    isDefault: config.isDefault,
    usage: config.usage,
    createdAt: config.createdAt,
  };
}

/**
 * Retrieves all embedding configurations belonging to a project.
 */
export async function getProjectEmbeddingConfigs(projectId, owner) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOne({ _id: projectId, owner });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const configs = await EmbeddingConfig.find({ project: projectId, owner })
    .sort({ isDefault: -1, createdAt: -1 })
    .select(
      "name provider model dimensions maskedApiKey baseUrl project isDefault usage createdAt updatedAt"
    );

  return configs.map((c) => ({
    id: c._id,
    name: c.name,
    provider: c.provider,
    model: c.model,
    dimensions: c.dimensions,
    maskedApiKey: c.maskedApiKey,
    baseUrl: c.baseUrl,
    project: c.project,
    isDefault: c.isDefault,
    usage: c.usage,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

/**
 * Retrieves a single embedding configuration by ID.
 */
export async function getEmbeddingConfigById(configId, owner) {
  if (!mongoose.Types.ObjectId.isValid(configId)) {
    throw new ApiError(400, "Invalid embedding config ID");
  }

  const config = await EmbeddingConfig.findOne({
    _id: configId,
    owner,
  }).select(
    "name provider model dimensions maskedApiKey baseUrl project isDefault usage createdAt updatedAt"
  );

  if (!config) {
    throw new ApiError(404, "Embedding configuration not found");
  }

  return {
    id: config._id,
    name: config.name,
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    maskedApiKey: config.maskedApiKey,
    baseUrl: config.baseUrl,
    project: config.project,
    isDefault: config.isDefault,
    usage: config.usage,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

/**
 * Deletes an embedding configuration if it is not currently referenced by any Knowledge Base.
 */
export async function deleteEmbeddingConfig(configId, owner) {
  if (!mongoose.Types.ObjectId.isValid(configId)) {
    throw new ApiError(400, "Invalid embedding config ID");
  }

  const config = await EmbeddingConfig.findOne({ _id: configId, owner });
  if (!config) {
    throw new ApiError(404, "Embedding configuration not found");
  }

  // Prevent deleting configs attached to active knowledge bases
  const attachedKb = await KnowledgeBase.findOne({
    embeddingConfig: config._id,
    owner,
  });

  if (attachedKb) {
    throw new ApiError(
      400,
      `Cannot delete configuration: it is currently used by knowledge base "${attachedKb.name}"`
    );
  }

  await EmbeddingConfig.deleteOne({ _id: config._id });

  return {
    id: config._id,
    name: config.name,
    deleted: true,
  };
}

