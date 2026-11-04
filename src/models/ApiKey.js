import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    keyHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    keyPrefix: {
      type: String,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ApiKey =
  mongoose.models.ApiKey ||
  mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;