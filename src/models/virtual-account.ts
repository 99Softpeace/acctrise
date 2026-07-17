import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const virtualAccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  provider: { type: String, default: "pocketfi", required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  bankCode: { type: String, default: null },
  providerReference: { type: String, default: null },
  creditedCents: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export type VirtualAccountDocument = InferSchemaType<typeof virtualAccountSchema> & { _id: Types.ObjectId };
export const VirtualAccount = (models.VirtualAccount || model("VirtualAccount", virtualAccountSchema)) as Model<VirtualAccountDocument>;