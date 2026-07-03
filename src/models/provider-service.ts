import mongoose, { type InferSchemaType, type Model, Types } from "mongoose";

const { Schema, model, models } = mongoose;

const providerServiceSchema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    externalId: { type: String, required: true },
    externalName: { type: String, default: null },
    providerPriceCents: { type: Number, required: true, min: 0 },
    costPriceCents: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    stock: { type: Number, default: null },
    lastSyncedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

providerServiceSchema.index({ providerId: 1, serviceId: 1 }, { unique: true });
providerServiceSchema.index({ providerId: 1, externalId: 1 }, { unique: true });

export type ProviderServiceDocument = InferSchemaType<typeof providerServiceSchema> & { _id: Types.ObjectId };
export const ProviderService = (
  models.ProviderService || model("ProviderService", providerServiceSchema)
) as Model<ProviderServiceDocument>;
