import connectDB from "@/config/db";
import {
  getEmbeddingConfigByIdController,
  deleteEmbeddingConfigController,
} from "@/controllers/embedding-config.controller";
import { withAuth } from "@/middleware/with-auth";

// GET /api/v1/embedding-configs/[configId]: Get a single embedding configuration
export const GET = withAuth(async (request, { authUser, params }) => {
  await connectDB();
  const { configId } = await params;
  return await getEmbeddingConfigByIdController(request, authUser, configId);
});

// DELETE /api/v1/embedding-configs/[configId]: Delete an unused embedding configuration
export const DELETE = withAuth(async (request, { authUser, params }) => {
  await connectDB();
  const { configId } = await params;
  return await deleteEmbeddingConfigController(request, authUser, configId);
});

