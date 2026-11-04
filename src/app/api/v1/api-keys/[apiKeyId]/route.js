import connectDB from "@/config/db";
import { withAuth } from "@/middleware/with-auth";
import { revokeApiKey } from "@/services/api-key.service";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";

export const DELETE = withAuth(async (request, { authUser, params }) => {
  try {
    await connectDB();

    const { apiKeyId } = await params;

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
});