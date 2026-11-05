import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document reference is required"],
      index: true,
    },

    knowledgeBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeBase",
      required: [true, "Knowledge base reference is required"],
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
      index: true,
    },

    // 0-indexed position of this chunk within the parent document
    chunkIndex: {
      type: Number,
      required: [true, "Chunk index is required"],
      min: 0,
    },

    // The extracted and cleaned text segment
    content: {
      type: String,
      required: [true, "Chunk content is required"],
    },

    // Length of the text content in characters
    characterCount: {
      type: Number,
      required: true,
      min: 1,
    },

    // Estimated or measured token count
    tokenCount: {
      type: Number,
      default: null,
    },

    // Vector embedding array (e.g. 1536 float dimensions for text-embedding-3-small)
    // Left undefined until generated in the embedding phase
    embedding: {
      type: [Number],
      default: undefined,
    },

    // Flexible metadata for retrieval filtering and citations (e.g., page, section, source)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch or delete chunks in sequential order for a document
chunkSchema.index({ document: 1, chunkIndex: 1 });

// Compound index for tenant-isolated retrieval queries within a knowledge base
chunkSchema.index({ knowledgeBase: 1, owner: 1 });

// Full-text search index for keyword retrieval and hybrid search
chunkSchema.index({ content: "text" });

const Chunk =
  mongoose.models.Chunk || mongoose.model("Chunk", chunkSchema);

export default Chunk;

