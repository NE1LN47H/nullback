import KnowledgeBase from "@/models/KnowledgeBase";
import Project from "@/models/Project";
import mongoose from "mongoose";
import { ApiError } from "@/lib/api-error";

// Create a knowledge base
export async function createKnowledgeBase({
  name,
  description,
  projectId,
  owner,
}) {
  // Verify that the project belongs to the developer
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

  const knowledgeBase = await KnowledgeBase.create({
    name,
    description,
    project: projectId,
    owner,
  });

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
    status: knowledgeBase.status,
    createdAt: knowledgeBase.createdAt,
  };
}

export async function getProjectKnowledgeBases(projectId, owner) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  // Verify project ownership
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
    .select("name description project status createdAt updatedAt");

  return knowledgeBases.map((knowledgeBase) => ({
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
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
  }).select("name description project status createdAt updatedAt");

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
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
  ).select("name description project status createdAt updatedAt");

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
    description: knowledgeBase.description,
    project: knowledgeBase.project,
    status: knowledgeBase.status,
    createdAt: knowledgeBase.createdAt,
    updatedAt: knowledgeBase.updatedAt,
  };
}

export async function deleteKnowledgeBase(knowledgeBaseId, owner) {
  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  const knowledgeBase = await KnowledgeBase.findOneAndDelete({
    _id: knowledgeBaseId,
    owner,
  });

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  return {
    id: knowledgeBase._id,
    name: knowledgeBase.name,
  };
}