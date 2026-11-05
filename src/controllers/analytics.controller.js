import {
  getProjectAnalytics,
  getKnowledgeBaseAnalytics,
  getRequestLogs,
} from "@/services/analytics.service";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";

export async function getProjectAnalyticsController(
  request,
  authUser,
  projectId
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || 7;

    const analytics = await getProjectAnalytics(projectId, authUser.userId, {
      days,
    });

    return successResponse(analytics, "Project analytics retrieved successfully");
  } catch (error) {
    return handleError(error);
  }
}

export async function getKnowledgeBaseAnalyticsController(
  request,
  authUser,
  knowledgeBaseId
) {
  try {
    const analytics = await getKnowledgeBaseAnalytics(
      knowledgeBaseId,
      authUser.userId
    );

    return successResponse(
      analytics,
      "Knowledge base analytics retrieved successfully"
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getRequestLogsController(request, authUser) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const knowledgeBaseId = searchParams.get("knowledgeBaseId");
    const limit = searchParams.get("limit") || 50;
    const page = searchParams.get("page") || 1;

    const data = await getRequestLogs(authUser.userId, {
      projectId,
      knowledgeBaseId,
      limit,
      page,
    });

    return successResponse(data, "Request logs retrieved successfully");
  } catch (error) {
    return handleError(error);
  }
}

