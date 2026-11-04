import { verifyAccessToken } from "@/lib/jwt";
import { ApiError } from "@/lib/api-error";

export function authenticateRequest(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  try {
    const decoded = verifyAccessToken(token);

    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }
}