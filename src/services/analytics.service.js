import RequestLog from "@/models/RequestLog";
import KnowledgeBase from "@/models/KnowledgeBase";
import Document from "@/models/Document";
import Chunk from "@/models/Chunk";
import Project from "@/models/Project";
import { ApiError } from "@/lib/api-error";
import mongoose from "mongoose";

/**
 * Non-blocking logger to record API request performance and usage.
 * Guaranteed never to throw or interrupt the primary request lifecycle.
 */
export async function recordRequestLog(logData) {
  try {
    if (!logData || !logData.owner || !logData.endpoint) {
      return;
    }

    await RequestLog.create({
      owner: logData.owner,
      project: logData.project || null,
      knowledgeBase: logData.knowledgeBase || null,
      apiKey: logData.apiKey || null,
      endpoint: logData.endpoint,
      method: logData.method || "POST",
      statusCode: logData.statusCode || 200,
      latencyMs: typeof logData.latencyMs === "number" ? Math.max(0, logData.latencyMs) : 0,
      query: logData.query ? logData.query.slice(0, 1000) : null,
      resultsCount: logData.resultsCount || 0,
      tokensUsed: logData.tokensUsed || 0,
      errorMessage: logData.errorMessage ? logData.errorMessage.slice(0, 1000) : null,
    });
  } catch (error) {
    console.warn("Failed to persist request log:", error.message);
  }
}

/**
 * Computes aggregate analytics for a project dashboard.
 */
export async function getProjectAnalytics(projectId, owner, { days = 7 } = {}) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findOne({ _id: projectId, owner });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const ownerObjectId = new mongoose.Types.ObjectId(owner);

  // Time window boundary
  const daysNum = Math.min(Math.max(1, parseInt(days, 10) || 7), 90);
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysNum);

  // 1. Resource counts
  const [totalKnowledgeBases, totalDocuments, totalChunks] =
    await Promise.all([
      KnowledgeBase.countDocuments({ project: projectObjectId, owner: ownerObjectId }),
      Document.countDocuments({ project: projectObjectId, owner: ownerObjectId }),
      Chunk.countDocuments({ project: projectObjectId, owner: ownerObjectId }),
    ]);

  // 2. Request aggregation over time window
  const requestStats = await RequestLog.aggregate([
    {
      $match: {
        project: projectObjectId,
        owner: ownerObjectId,
        createdAt: { $gte: sinceDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        successfulRequests: {
          $sum: { $cond: [{ $lt: ["$statusCode", 400] }, 1, 0] },
        },
        failedRequests: {
          $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
        },
        avgLatencyMs: { $avg: "$latencyMs" },
        totalTokens: { $sum: "$tokensUsed" },
      },
    },
  ]);

  // 3. Daily time-series breakdown
  const dailyTimeSeries = await RequestLog.aggregate([
    {
      $match: {
        project: projectObjectId,
        owner: ownerObjectId,
        createdAt: { $gte: sinceDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        requests: { $sum: 1 },
        errors: {
          $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
        },
        avgLatencyMs: { $avg: "$latencyMs" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const stats = requestStats[0] || {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgLatencyMs: 0,
    totalTokens: 0,
  };

  return {
    projectId: project._id,
    projectName: project.name,
    resources: {
      knowledgeBases: totalKnowledgeBases,
      documents: totalDocuments,
      chunks: totalChunks,
    },
    metrics: {
      totalRequests: stats.totalRequests,
      successfulRequests: stats.successfulRequests,
      failedRequests: stats.failedRequests,
      avgLatencyMs: Math.round(stats.avgLatencyMs || 0),
      totalTokens: stats.totalTokens,
      successRate:
        stats.totalRequests > 0
          ? Number(
              ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(
                1
              )
            )
          : 100,
    },
    timeSeries: dailyTimeSeries.map((d) => ({
      date: d._id,
      requests: d.requests,
      errors: d.errors,
      avgLatencyMs: Math.round(d.avgLatencyMs || 0),
    })),
  };
}

/**
 * Computes retrieval performance and query logs for a specific knowledge base.
 */
export async function getKnowledgeBaseAnalytics(knowledgeBaseId, owner) {
  if (!mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    throw new ApiError(400, "Invalid knowledge base ID");
  }

  const kbObjectId = new mongoose.Types.ObjectId(knowledgeBaseId);
  const ownerObjectId = new mongoose.Types.ObjectId(owner);

  const knowledgeBase = await KnowledgeBase.findOne({
    _id: kbObjectId,
    owner: ownerObjectId,
  });

  if (!knowledgeBase) {
    throw new ApiError(404, "Knowledge base not found");
  }

  const [docCount, chunkCount, recentLogs, aggregateStats] = await Promise.all([
    Document.countDocuments({ knowledgeBase: kbObjectId, owner: ownerObjectId }),
    Chunk.countDocuments({ knowledgeBase: kbObjectId, owner: ownerObjectId }),
    RequestLog.find({
      knowledgeBase: kbObjectId,
      owner: ownerObjectId,
      endpoint: "/api/v1/retrieve",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("query statusCode latencyMs resultsCount createdAt"),
    RequestLog.aggregate([
      {
        $match: {
          knowledgeBase: kbObjectId,
          owner: ownerObjectId,
          endpoint: "/api/v1/retrieve",
        },
      },
      {
        $group: {
          _id: null,
          totalQueries: { $sum: 1 },
          avgLatencyMs: { $avg: "$latencyMs" },
          errorCount: {
            $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const stats = aggregateStats[0] || {
    totalQueries: 0,
    avgLatencyMs: 0,
    errorCount: 0,
  };

  return {
    knowledgeBaseId: knowledgeBase._id,
    name: knowledgeBase.name,
    embeddingModel: knowledgeBase.embeddingModel,
    embeddingDimensions: knowledgeBase.embeddingDimensions,
    documentCount: docCount,
    chunkCount,
    totalQueries: stats.totalQueries,
    avgLatencyMs: Math.round(stats.avgLatencyMs || 0),
    errorCount: stats.errorCount,
    recentQueries: recentLogs.map((log) => ({
      query: log.query,
      statusCode: log.statusCode,
      latencyMs: log.latencyMs,
      resultsCount: log.resultsCount,
      timestamp: log.createdAt,
    })),
  };
}

/**
 * Returns paginated request logs for auditing and debugging.
 */
export async function getRequestLogs(
  owner,
  { projectId = null, knowledgeBaseId = null, limit = 50, page = 1 } = {}
) {
  const query = { owner };

  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    query.project = projectId;
  }

  if (knowledgeBaseId && mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
    query.knowledgeBase = knowledgeBaseId;
  }

  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 50, 100));
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const [logs, total] = await Promise.all([
    RequestLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .select(
        "endpoint method statusCode latencyMs query resultsCount tokensUsed errorMessage createdAt"
      ),
    RequestLog.countDocuments(query),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log._id,
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
      latencyMs: log.latencyMs,
      query: log.query,
      resultsCount: log.resultsCount,
      tokensUsed: log.tokensUsed,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
    })),
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
}

