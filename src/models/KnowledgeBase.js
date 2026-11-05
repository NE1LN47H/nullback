import mongoose from "mongoose";

const knowledgeBaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Knowledge base name is required"],
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Reference to the active embedding profile for this knowledge base
    embeddingConfig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmbeddingConfig",
      default: null,
    },

    // Model name used for vector embeddings in this knowledge base
    embeddingModel: {
      type: String,
      default: "text-embedding-3-small",
    },

    // Fixed vector dimensionality for this knowledge base (must match vector index)
    embeddingDimensions: {
      type: Number,
      default: 1536,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

knowledgeBaseSchema.index({
  owner: 1,
  project: 1,
});

const KnowledgeBase =
  mongoose.models.KnowledgeBase ||
  mongoose.model("KnowledgeBase", knowledgeBaseSchema);

export default KnowledgeBase;
