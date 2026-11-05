import mongoose from "mongoose";

const embeddingConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Embedding configuration name is required"],
      trim: true,
      maxlength: 100,
    },

    provider: {
      type: String,
      enum: ["openai", "voyage", "cohere", "custom"],
      required: [true, "Provider is required"],
      default: "openai",
    },

    model: {
      type: String,
      required: [true, "Model name is required"],
      trim: true,
      default: "text-embedding-3-small",
    },

    // Vector dimensionality (e.g. 1536 for text-embedding-3-small, 3072 for text-embedding-3-large)
    dimensions: {
      type: Number,
      required: [true, "Dimensions count is required"],
      min: [1, "Dimensions must be at least 1"],
      max: [4096, "Dimensions cannot exceed 4096"],
      default: 1536,
    },

    // AES-256-GCM encrypted API key.
    // select: false ensures it is NEVER leaked in generic queries or API responses
    encryptedApiKey: {
      type: String,
      required: [true, "Encrypted API key is required"],
      select: false,
    },

    // Safe masked representation for developer UI/dashboard (e.g. "sk-...cdef")
    maskedApiKey: {
      type: String,
      required: true,
    },

    // Optional base URL for custom OpenAI-compatible endpoints (e.g., self-hosted Ollama, vLLM)
    baseUrl: {
      type: String,
      trim: true,
      default: null,
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

    isDefault: {
      type: Boolean,
      default: false,
    },

    // Cumulative usage analytics
    usage: {
      totalTokens: {
        type: Number,
        default: 0,
      },
      totalRequests: {
        type: Number,
        default: 0,
      },
      lastUsedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

embeddingConfigSchema.index({ project: 1, owner: 1 });
embeddingConfigSchema.index({ owner: 1 });

const EmbeddingConfig =
  mongoose.models.EmbeddingConfig ||
  mongoose.model("EmbeddingConfig", embeddingConfigSchema);

export default EmbeddingConfig;

