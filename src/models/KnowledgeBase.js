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