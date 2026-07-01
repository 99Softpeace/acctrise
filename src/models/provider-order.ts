import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const providerOrderSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
    externalOrderId: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true },
    statusMessage: { type: String, default: null },
    lastCheckedAt: { type: Date, default: null },
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date, default: null },
    logs: { type: Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

export type ProviderOrderDocument = InferSchemaType<typeof providerOrderSchema> & { _id: Types.ObjectId };
export const ProviderOrder = (
  models.ProviderOrder || model("ProviderOrder", providerOrderSchema)
) as Model<ProviderOrderDocument>;
