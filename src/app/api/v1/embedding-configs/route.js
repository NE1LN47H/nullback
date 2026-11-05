import connectDB from "@/config/db";
import {
  createEmbeddingConfigController,
  getEmbeddingConfigsController,
} from "@/controllers/embedding-config.controller";
import { withAuth } from "@/middleware/with-auth";

// POST /api/v1/embedding-configs: Register a BYOK embedding provider configuration
export const POST = withAuth(async (request, { authUser }) => {
  await connectDB();
  return await createEmbeddingConfigController(request, authUser);
});

// GET /api/v1/embedding-configs?projectId=...: List all embedding configurations for a project
export const GET = withAuth(async (request, { authUser }) => {
  await connectDB();
  return await getEmbeddingConfigsController(request, authUser);
});

