import connectDB from "@/config/db";
import { retrieveController } from "@/controllers/retrieval.controller";
import { withFlexibleAuth } from "@/middleware/with-flexible-auth";
import { applyRateLimit } from "@/middleware/rate-limit.middleware";

// POST /api/v1/retrieve
// Flagship RAG Retrieval Endpoint: accepts query, embeds it, and returns top-K semantically relevant chunks
export const POST = withFlexibleAuth(async (request, { authUser }) => {
  // Enforce Rate Limiting: 60 requests per minute per client key / user
  applyRateLimit(request, authUser, { maxRequests: 60, windowMs: 60000 });

  await connectDB();
  return await retrieveController(request, authUser);
});
