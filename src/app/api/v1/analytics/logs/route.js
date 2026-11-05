import connectDB from "@/config/db";
import { getRequestLogsController } from "@/controllers/analytics.controller";
import { withAuth } from "@/middleware/with-auth";

// GET /api/v1/analytics/logs?projectId=...&knowledgeBaseId=...&limit=50&page=1
export const GET = withAuth(async (request, { authUser }) => {
  await connectDB();
  return await getRequestLogsController(request, authUser);
});

