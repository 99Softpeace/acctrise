import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const orderLogSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type OrderLogDocument = InferSchemaType<typeof orderLogSchema> & { _id: Types.ObjectId };
export const OrderLog = (models.OrderLog || model("OrderLog", orderLogSchema)) as Model<OrderLogDocument>;
