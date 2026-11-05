import connectDB from "@/config/db";
import { getKnowledgeBaseAnalyticsController } from "@/controllers/analytics.controller";
import { withAuth } from "@/middleware/with-auth";

// GET /api/v1/analytics/knowledge-bases/[knowledgeBaseId]
export const GET = withAuth(async (request, { authUser, params }) => {
  await connectDB();
  const { knowledgeBaseId } = await params;
  return await getKnowledgeBaseAnalyticsController(
    request,
    authUser,
    knowledgeBaseId
  );
});

