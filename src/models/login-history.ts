import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const loginHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    device: { type: String, default: null },
    location: { type: String, default: null },
    isSuccessful: { type: Boolean, required: true },
    failureReason: { type: String, default: null }
  },
  { timestamps: true }
);

export type LoginHistoryDocument = InferSchemaType<typeof loginHistorySchema> & { _id: Types.ObjectId };
export const LoginHistory = (
  models.LoginHistory || model("LoginHistory", loginHistorySchema)
) as Model<LoginHistoryDocument>;
