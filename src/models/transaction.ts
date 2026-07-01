import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

export const transactionTypes = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "ORDER_PAYMENT",
  "REFUND",
  "BONUS",
  "COUPON",
  "REFERRAL_REWARD"
] as const;

export const transactionStatuses = ["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"] as const;

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null, index: true },
    type: { type: String, enum: transactionTypes, required: true },
    status: { type: String, enum: transactionStatuses, default: "PENDING", required: true, index: true },
    amountCents: { type: Number, required: true, min: 0 },
    feeCents: { type: Number, default: 0, min: 0 },
    netAmountCents: { type: Number, required: true, min: 0 },
    reference: { type: String, unique: true, sparse: true, index: true },
    paymentMethod: { type: String, default: null },
    paymentGateway: { type: String, default: null },
    transactionHash: { type: String, default: null },
    gatewayReference: { type: String, default: null },
    description: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    failureReason: { type: String, default: null },
    reversalOfId: { type: Schema.Types.ObjectId, ref: "Transaction", default: null, unique: true, sparse: true }
  },
  { timestamps: true }
);

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & { _id: Types.ObjectId };
export type TransactionType = (typeof transactionTypes)[number];
export type TransactionStatus = (typeof transactionStatuses)[number];
export const Transaction = (models.Transaction || model("Transaction", transactionSchema)) as Model<TransactionDocument>;
