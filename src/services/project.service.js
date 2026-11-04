import mongoose from "mongoose";
import Project from "@/models/Project";
import { ApiError } from "@/lib/api-error";

export async function createProject({ name, description, owner }) {
  const project = await Project.create({
    name,
    description,
    owner,
  });

  return {
    id: project._id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
  };
}

export async function getUserProjects(userId) {
  const projects = await Project.find({
    owner: userId,
  })
    .sort({ createdAt: -1 })
    .select("name description status createdAt updatedAt");

  return projects.map((project) => ({
    id: project._id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));
}

export async function getProjectById(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOne({
    _id: projectId,
    owner: userId,
  }).select("name description status createdAt updatedAt");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return {
    id: project._id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function updateProject(projectId, userId, updates) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOneAndUpdate(
    {
      _id: projectId,
      owner: userId,
    },
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("name description status createdAt updatedAt");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return {
    id: project._id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function deleteProject(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOneAndDelete({
    _id: projectId,
    owner: userId,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return {
    id: project._id,
    name: project.name,
  };
}