import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

export const orderStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPriceCents: { type: Number, required: true, min: 0 },
    totalPriceCents: { type: Number, required: true, min: 0 },
    status: { type: String, enum: orderStatuses, default: "PENDING", index: true },
    targetUrl: { type: String, default: null },
    targetUsername: { type: String, default: null },
    targetPhone: { type: String, default: null },
    additionalInfo: { type: Schema.Types.Mixed, default: {} },
    delivered: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    statusMessage: { type: String, default: null },
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date, default: null },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", default: null, unique: true, sparse: true }
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof orderSchema> & { _id: Types.ObjectId };
export const Order = (models.Order || model("Order", orderSchema)) as Model<OrderDocument>;
