import KnowledgeBase from "@/models/KnowledgeBase";
import Project from "@/models/Project";
import Document from "@/models/Document";
import Chunk from "@/models/Chunk";
import EmbeddingConfig from "@/models/EmbeddingConfig";
import { deleteFile } from "../../storage/local-storage";
import mongoose from "mongoose";
import { ApiError } from "@/lib/api-error";

// Create a knowledge base with optional embedding configuration binding
export async function createKnowledgeBase({
  name,
  description,
  projectId,
  embeddingConfigId = null,
  owner,
}) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOne({
    _id: projectId,
    owner,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  let embeddingConfig = null;
  if (embeddingConfigId) {
    if (!mongoose.Types.ObjectId.isValid(embeddingConfigId)) {
      throw new ApiError(400, "Invalid embedding config ID");
    }
    embeddingConfig = await EmbeddingConfig.findOne({
      _id: embeddingConfigId,
      owner,
    });
    if (!embeddingConfig) {
      throw new ApiError(404, "Embedding configuration not found");
    }
  }

  const knowledgeBase = await KnowledgeBase.create({
    name,
    description,
    project: projectId,
    owner,
    embeddingConfig: embeddingConfig?._id || null,
    embeddingModel: embeddingConfig?.model || "text-embedding-3-small",
    embeddingDimensions: embeddingConfig?.dimensions || 1536,
  });

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
    embeddingConfig: knowledgeBase.embeddingConfig,
    embeddingModel: knowledgeBase.embeddingModel,
    embeddingDimensions: knowledgeBase.embeddingDimensions,
    status: knowledgeBase.status,
    createdAt: knowledgeBase.createdAt,
  };
}

export async function getProjectKnowledgeBases(projectId, owner) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOne({
    _id: projectId,
    owner,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const knowledgeBases = await KnowledgeBase.find({
    project: projectId,
    owner,
  })
    .sort({ createdAt: -1 })
    .select(
      "name description project embeddingConfig embeddingModel embeddingDimensions status createdAt updatedAt"
    );

  return knowledgeBases.map((knowledgeBase) => ({
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
    embeddingConfig: knowledgeBase.embeddingConfig,
    embeddingModel: knowledgeBase.embeddingModel,
    embeddingDimensions: knowledgeBase.embeddingDimensions,
    status: knowledgeBase.status,
    createdAt: knowledgeBase.createdAt,
    updatedAt: knowledgeBase.updatedAt,
  }));
}

export async function getKnowledgeBaseById(knowledgeBaseId, owner) {
  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  const knowledgeBase = await KnowledgeBase.findOne({
    _id: knowledgeBaseId,
    owner,
  }).select(
    "name description project embeddingConfig embeddingModel embeddingDimensions status createdAt updatedAt"
  );

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
    embeddingConfig: knowledgeBase.embeddingConfig,
    embeddingModel: knowledgeBase.embeddingModel,
    embeddingDimensions: knowledgeBase.embeddingDimensions,
    status: knowledgeBase.status,
    createdAt: knowledgeBase.createdAt,
    updatedAt: knowledgeBase.updatedAt,
  };
}

export async function updateKnowledgeBase(
  knowledgeBaseId,
  owner,
  updates
) {
  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  // If updating the embedding config, validate existence and sync dimensions
  if (updates.embeddingConfig) {
    if (!mongoose.Types.ObjectId.isValid(updates.embeddingConfig)) {
      throw new ApiError(400, "Invalid embedding config ID");
    }
    const config = await EmbeddingConfig.findOne({
      _id: updates.embeddingConfig,
      owner,
    });
    if (!config) {
      throw new ApiError(404, "Embedding configuration not found");
    }
    updates.embeddingModel = config.model;
    updates.embeddingDimensions = config.dimensions;
  }

  const knowledgeBase = await KnowledgeBase.findOneAndUpdate(
    {
      _id: knowledgeBaseId,
      owner,
    },
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(
    "name description project embeddingConfig embeddingModel embeddingDimensions status createdAt updatedAt"
  );

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
    embeddingConfig: knowledgeBase.embeddingConfig,
    embeddingModel: knowledgeBase.embeddingModel,
    embeddingDimensions: knowledgeBase.embeddingDimensions,
    status: knowledgeBase.status,
    createdAt: knowledgeBase.createdAt,
    updatedAt: knowledgeBase.updatedAt,
  };
}

/**
 * Permanently deletes a knowledge base and cascades deletion to:
 * 1. All physical files stored on disk for its documents
 * 2. All chunks and vector representations in MongoDB
 * 3. All document metadata records in MongoDB
 * 4. The knowledge base record itself
 */
export async function deleteKnowledgeBase(knowledgeBaseId, owner) {
  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  // 1. Verify knowledge base ownership
  const knowledgeBase = await KnowledgeBase.findOne({
    _id: knowledgeBaseId,
    owner,
  });

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  // 2. Fetch all documents in this knowledge base to get storage keys
  const documents = await Document.find({
    knowledgeBase: knowledgeBase._id,
    owner,
  }).select("storageKey");

  // 3. Delete physical files from disk
  if (documents.length > 0) {
    await Promise.allSettled(
      documents.map((doc) =>
        deleteFile(doc.storageKey).catch((err) => {
          console.warn(
            `File cleanup warning for ${doc.storageKey}:`,
            err.message
          );
        })
      )
    );
  }

  // 4. Cascade delete all chunks belonging to this knowledge base
  await Chunk.deleteMany({
    knowledgeBase: knowledgeBase._id,
    owner,
  });

  // 5. Cascade delete all documents belonging to this knowledge base
  await Document.deleteMany({
    knowledgeBase: knowledgeBase._id,
    owner,
  });

  // 6. Delete the knowledge base record itself
  await KnowledgeBase.deleteOne({
    _id: knowledgeBase._id,
  });

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    deletedDocumentsCount: documents.length,
  };
}
