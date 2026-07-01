import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const walletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    balanceCents: { type: Number, default: 0, min: 0 },
    lockedBalanceCents: { type: Number, default: 0, min: 0 },
    totalDepositedCents: { type: Number, default: 0, min: 0 },
    totalWithdrawnCents: { type: Number, default: 0, min: 0 },
    bonusBalanceCents: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "NGN", uppercase: true, trim: true }
  },
  { timestamps: true }
);

export type WalletDocument = InferSchemaType<typeof walletSchema> & { _id: Types.ObjectId };
export const Wallet = (models.Wallet || model("Wallet", walletSchema)) as Model<WalletDocument>;
