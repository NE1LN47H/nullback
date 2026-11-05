import {
  createEmbeddingConfig,
  getProjectEmbeddingConfigs,
  getEmbeddingConfigById,
  deleteEmbeddingConfig,
} from "@/services/embedding-config.service";
import { successResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { handleError } from "@/lib/handle-error";

export async function createEmbeddingConfigController(request, authUser) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Invalid JSON request body");
    }

    const {
      name,
      provider,
      model,
      dimensions,
      apiKey,
      baseUrl,
      projectId,
      isDefault,
    } = body || {};

    const config = await createEmbeddingConfig({
      name,
      provider,
      model,
      dimensions: dimensions ? Number(dimensions) : undefined,
      apiKey,
      baseUrl,
      projectId,
      isDefault: Boolean(isDefault),
      owner: authUser.userId,
    });

    return successResponse(
      { embeddingConfig: config },
      "Embedding configuration created successfully",
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getEmbeddingConfigsController(request, authUser) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }

    const configs = await getProjectEmbeddingConfigs(
      projectId,
      authUser.userId
    );

    return successResponse(
      { embeddingConfigs: configs },
      "Embedding configurations retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getEmbeddingConfigByIdController(
  request,
  authUser,
  configId
) {
  try {
    const config = await getEmbeddingConfigById(configId, authUser.userId);

    return successResponse(
      { embeddingConfig: config },
      "Embedding configuration retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteEmbeddingConfigController(
  request,
  authUser,
  configId
) {
  try {
    const result = await deleteEmbeddingConfig(configId, authUser.userId);

    return successResponse(
      { embeddingConfig: result },
      "Embedding configuration deleted successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

