import { createKnowledgeBase } from "@/services/knowledge-base.service";
import { getProjectKnowledgeBases } from "@/services/knowledge-base.service";
import { getKnowledgeBaseById } from "@/services/knowledge-base.service";
import { updateKnowledgeBase } from "@/services/knowledge-base.service";
import { deleteKnowledgeBase } from "@/services/knowledge-base.service";
import { ApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";

export async function createKnowledgeBaseController(request, authUser) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const description = body.description?.trim() || "";
    const projectId = body.projectId;

    if (!name) {
      throw new ApiError(400, "Knowledge base name is required");
    }

    if (name.length > 100) {
      throw new ApiError(400, "Name cannot exceed 100 characters");
    }

    if (description.length > 500) {
      throw new ApiError(400, "Description cannot exceed 500 characters");
    }

    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }

    const knowledgeBase = await createKnowledgeBase({
      name,
      description,
      projectId,
      owner: authUser.userId,
    });

    return successResponse(
      { knowledgeBase },
      "Knowledge base created successfully",
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getProjectKnowledgeBasesController(
  request,
  authUser
) {
  try {
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get("projectId");

    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }

    const knowledgeBases = await getProjectKnowledgeBases(
      projectId,
      authUser.userId
    );

    return successResponse(
      { knowledgeBases },
      "Knowledge bases retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getKnowledgeBaseByIdController(
  request,
  authUser,
  knowledgeBaseId
) {
  try {
    const knowledgeBase = await getKnowledgeBaseById(
      knowledgeBaseId,
      authUser.userId
    );

    return successResponse(
      { knowledgeBase },
      "Knowledge base retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function updateKnowledgeBaseController(
  request,
  authUser,
  knowledgeBaseId
) {
  try {
    const body = await request.json();

    const updates = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        throw new ApiError(400, "Name cannot be empty");
      }

      if (body.name.trim().length > 100) {
        throw new ApiError(400, "Name cannot exceed 100 characters");
      }

      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        throw new ApiError(400, "Description must be a string");
      }

      if (body.description.trim().length > 500) {
        throw new ApiError(400, "Description cannot exceed 500 characters");
      }

      updates.description = body.description.trim();
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields provided for update");
    }

    const knowledgeBase = await updateKnowledgeBase(
      knowledgeBaseId,
      authUser.userId,
      updates
    );

    return successResponse(
      { knowledgeBase },
      "Knowledge base updated successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteKnowledgeBaseController(
  request,
  authUser,
  knowledgeBaseId
) {
  try {
    const result = await deleteKnowledgeBase(
      knowledgeBaseId,
      authUser.userId
    );

    return successResponse(
      { knowledgeBase: result },
      "Knowledge base deleted successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}