import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    storageKey: {
      type: String,
      required: true,
    },

    // Cryptographic SHA-256 hash of the file contents for duplicate detection
    fileHash: {
      type: String,
      default: null,
      index: true,
    },

    knowledgeBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeBase",
      required: true,
      index: true,
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
      enum: [
        "uploaded",
        "queued",
        "processing",
        "processed",
        "failed",
      ],
      default: "uploaded",
    },

    errorMessage: {
      type: String,
      default: null,
    },

    pageCount: {
      type: Number,
      default: null,
    },

    characterCount: {
      type: Number,
      default: 0,
    },

    chunkCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({
  owner: 1,
  knowledgeBase: 1,
});

documentSchema.index({
  knowledgeBase: 1,
  owner: 1,
  fileHash: 1,
});

const Document =
  mongoose.models.Document ||
  mongoose.model("Document", documentSchema);

export default Document;
