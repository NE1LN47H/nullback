import connectDB from "@/config/db";
import { getProjectAnalyticsController } from "@/controllers/analytics.controller";
import { withAuth } from "@/middleware/with-auth";

// GET /api/v1/analytics/projects/[projectId]?days=7
export const GET = withAuth(async (request, { authUser, params }) => {
  await connectDB();
  const { projectId } = await params;
  return await getProjectAnalyticsController(request, authUser, projectId);
});

