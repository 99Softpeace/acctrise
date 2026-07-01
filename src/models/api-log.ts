import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const apiLogSchema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, default: null },
    requestBody: { type: String, default: null },
    responseBody: { type: String, default: null },
    errorMessage: { type: String, default: null },
    duration: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

export type ApiLogDocument = InferSchemaType<typeof apiLogSchema> & { _id: Types.ObjectId };
export const ApiLog = (models.ApiLog || model("ApiLog", apiLogSchema)) as Model<ApiLogDocument>;
