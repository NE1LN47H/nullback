import { authenticateRequest } from "@/middleware/auth.middleware";
import { handleError } from "@/lib/handle-error";

export function withAuth(handler) {
  return async function (request, context) {
    try {
      const authUser = authenticateRequest(request);

      return await handler(request, {
        ...context,
        authUser,
      });
    } catch (error) {
      return handleError(error);
    }
  };
}