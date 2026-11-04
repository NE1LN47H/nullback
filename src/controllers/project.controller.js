import { createProject } from "@/services/project.service";
import { successResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { handleError } from "@/lib/handle-error";
import { getUserProjects } from "@/services/project.service";
import { getProjectById } from "@/services/project.service";
import { updateProject } from "@/services/project.service";
import { deleteProject } from "@/services/project.service";

export async function createProjectController(request, authUser) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON request body");
    }

    const { name, description = "" } = body || {};

    if (typeof name !== "string") {
      throw new ApiError(400, "Project name is required");
    }

    if (typeof description !== "string") {
      throw new ApiError(400, "Description must be a string");
    }

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      throw new ApiError(400, "Project name must be between 2 and 100 characters");
    }

    if (cleanDescription.length > 500) {
      throw new ApiError(400, "Description cannot exceed 500 characters");
    }

    const project = await createProject({
      name: cleanName,
      description: cleanDescription,
      owner: authUser.userId,
    });

    return successResponse(
      { project },
      "Project created successfully",
      201
    );

  } catch (error) {
    return handleError(error);
  }
}

export async function getUserProjectsController(authUser) {
  try {
    const projects = await getUserProjects(authUser.userId);

    return successResponse(
      { projects },
      "Projects retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getProjectByIdController(
  request,
  authUser,
  projectId
) {
  try {
    const project = await getProjectById(
      projectId,
      authUser.userId
    );

    return successResponse(
      { project },
      "Project retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProjectController(
  request,
  authUser,
  projectId
) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON request body");
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiError(400, "Invalid request body");
    }

    const allowedFields = ["name", "description"];
    const updates = {};

    for (const field of Object.keys(body)) {
      if (!allowedFields.includes(field)) {
        throw new ApiError(400, `Field '${field}' cannot be updated`);
      }
    }

    if (Object.keys(body).length === 0) {
      throw new ApiError(400, "Provide at least one field to update");
    }

    if ("name" in body) {
      if (typeof body.name !== "string") {
        throw new ApiError(400, "Project name must be a string");
      }

      const name = body.name.trim();

      if (name.length < 2 || name.length > 100) {
        throw new ApiError(400, "Project name must be between 2 and 100 characters");
      }

      updates.name = name;
    }

    if ("description" in body) {
      if (typeof body.description !== "string") {
        throw new ApiError(400, "Description must be a string");
      }

      const description = body.description.trim();

      if (description.length > 500) {
        throw new ApiError(400, "Description cannot exceed 500 characters");
      }

      updates.description = description;
    }

    const project = await updateProject(
      projectId,
      authUser.userId,
      updates
    );

    return successResponse(
      { project },
      "Project updated successfully"
    );

  } catch (error) {
    return handleError(error);
  }
}

export async function deleteProjectController(
  authUser,
  projectId
) {
  try {
    const project = await deleteProject(
      projectId,
      authUser.userId
    );

    return successResponse(
      { project },
      "Project deleted successfully"
    );

  } catch (error) {
    return handleError(error);
  }
}