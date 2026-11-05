import { authenticateApiKey } from "@/middleware/api-key.middleware";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { handleError } from "@/lib/handle-error";
import { ApiError } from "@/lib/api-error";

/**
 * Flexible authentication middleware that accepts either:
 * 1. An API Key (Authorization: Bearer nb_live_...) for programmatic developer access
 * 2. A JWT Access Token (Authorization: Bearer <jwt>) for dashboard/playground access
 */
export function withFlexibleAuth(handler) {
  return async function (request, context) {
    try {
      const authorization = request.headers.get("authorization");

      if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new ApiError(
          401,
          "Authentication required. Provide an API key (Bearer nb_live_...) or access token."
        );
      }

      const rawToken = authorization.slice(7).trim();

      let authUser;

      if (rawToken.startsWith("nb_live_")) {
        const apiUser = await authenticateApiKey(request);
        authUser = {
          userId: apiUser.userId,
          apiKeyId: apiUser.apiKeyId,
          authType: "api_key",
        };
      } else {
        const jwtUser = authenticateRequest(request);
        authUser = {
          userId: jwtUser.userId,
          role: jwtUser.role,
          authType: "jwt",
        };
      }

      return await handler(request, {
        ...context,
        authUser,
      });
    } catch (error) {
      return handleError(error);
    }
  };
}

