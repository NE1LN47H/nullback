import mongoose from "mongoose";

const requestLogSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
      default: null,
    },

    knowledgeBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeBase",
      index: true,
      default: null,
    },

    apiKey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      index: true,
      default: null,
    },

    endpoint: {
      type: String,
      required: true,
      index: true,
    },

    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },

    statusCode: {
      type: Number,
      required: true,
      index: true,
    },

    latencyMs: {
      type: Number,
      required: true,
      min: 0,
    },

    // Query text for retrieval requests (for developer observability)
    query: {
      type: String,
      default: null,
      maxlength: 1000,
    },

    resultsCount: {
      type: Number,
      default: 0,
    },

    tokensUsed: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
      default: null,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant time-series dashboard queries
requestLogSchema.index({ owner: 1, createdAt: -1 });
requestLogSchema.index({ project: 1, createdAt: -1 });
requestLogSchema.index({ knowledgeBase: 1, createdAt: -1 });

const RequestLog =
  mongoose.models.RequestLog ||
  mongoose.model("RequestLog", requestLogSchema);

export default RequestLog;

