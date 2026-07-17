import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
}, { timestamps: true });

export type RateLimitDocument = InferSchemaType<typeof rateLimitSchema> & { _id: Types.ObjectId };
export const RateLimit = (models.RateLimit || model("RateLimit", rateLimitSchema)) as Model<RateLimitDocument>;
