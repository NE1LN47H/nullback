import { createApiKey } from "@/services/api-key.service";
import { ApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";
import { getUserApiKeys } from "@/services/api-key.service";
import { revokeApiKey } from "@/services/api-key.service";

export async function createApiKeyController(request, authUser) {
  try {
    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      throw new ApiError(400, "API key name is required");
    }

    if (name.length > 100) {
      throw new ApiError(400, "API key name cannot exceed 100 characters");
    }

    const result = await createApiKey({
      name,
      owner: authUser.userId,
    });

    return successResponse(
      result,
      "API key created successfully",
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getUserApiKeysController(authUser) {
  try {
    const apiKeys = await getUserApiKeys(authUser.userId);

    return successResponse(
      { apiKeys },
      "API keys retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function revokeApiKeyController(request, authUser) {
  try {
    const { apiKeyId } = await request.json();

    if (!apiKeyId) {
      throw new ApiError(400, "API key ID is required");
    }

    const apiKey = await revokeApiKey(
      apiKeyId,
      authUser.userId
    );

    return successResponse(
      { apiKey },
      "API key revoked successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}