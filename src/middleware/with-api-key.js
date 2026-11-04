import { authenticateApiKey } from "@/middleware/api-key.middleware";
import { handleError } from "@/lib/handle-error";

export function withApiKey(handler) {
  return async function (request, context) {
    try {
      const apiUser = await authenticateApiKey(request);

      return await handler(request, {
        ...context,
        apiUser,
      });
    } catch (error) {
      return handleError(error);
    }
  };
}