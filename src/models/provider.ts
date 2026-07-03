import mongoose, { type InferSchemaType, type Model, Types } from "mongoose";

const { Schema, model, models } = mongoose;

export const providerStatuses = ["ACTIVE", "INACTIVE", "MAINTENANCE", "ERROR"] as const;
export type ProviderStatus = (typeof providerStatuses)[number];

const providerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: null },
    webUrl: { type: String, default: null },
    logoUrl: { type: String, default: null },
    type: { type: String, required: true, index: true },
    status: { type: String, enum: providerStatuses, default: "ACTIVE", index: true },
    config: { type: Schema.Types.Mixed, default: {} },
    retryPolicy: { type: Schema.Types.Mixed, default: null },
    rateLimit: { type: Schema.Types.Mixed, default: null },
    lastSyncAt: { type: Date, default: null },
    syncInterval: { type: Number, default: 300 },
    isHealthy: { type: Boolean, default: true },
    healthCheckUrl: { type: String, default: null }
  },
  { timestamps: true }
);

export type ProviderDocument = InferSchemaType<typeof providerSchema> & { _id: Types.ObjectId };
export const Provider = (models.Provider || model("Provider", providerSchema)) as Model<ProviderDocument>;
