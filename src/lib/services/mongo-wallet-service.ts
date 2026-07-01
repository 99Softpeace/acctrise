import { Types } from "mongoose";
import { connectMongo } from "@/lib/mongodb";
import { Transaction, type TransactionStatus, type TransactionType } from "@/models/transaction";
import { Wallet } from "@/models/wallet";
import type { PaymentGatewayId } from "@/lib/payments";

export function centsFromAmount(amount: number | string): number {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return Math.round(value * 100);
}

export function amountFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function mongoId(id: string, label = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`);
  }

  return new Types.ObjectId(id);
}

function reference(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export type WalletResponse = {
  id: string;
  balance: string;
  lockedBalance: string;
  bonusBalance: string;
  totalDeposited: string;
  totalWithdrawn: string;
  currency: string;
};

export type TransactionResponse = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  fee: string;
  netAmount: string;
  reference?: string | null;
  paymentMethod?: string | null;
  paymentGateway?: string | null;
  transactionHash?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function serializeWallet(wallet: any): WalletResponse {
  return {
    id: wallet._id.toString(),
    balance: amountFromCents(wallet.balanceCents),
    lockedBalance: amountFromCents(wallet.lockedBalanceCents),
    bonusBalance: amountFromCents(wallet.bonusBalanceCents),
    totalDeposited: amountFromCents(wallet.totalDepositedCents),
    totalWithdrawn: amountFromCents(wallet.totalWithdrawnCents),
    currency: wallet.currency
  };
}

function serializeTransaction(transaction: any): TransactionResponse {
  return {
    id: transaction._id.toString(),
    type: transaction.type,
    status: transaction.status,
    amount: amountFromCents(transaction.amountCents),
    fee: amountFromCents(transaction.feeCents),
    netAmount: amountFromCents(transaction.netAmountCents),
    reference: transaction.reference,
    paymentMethod: transaction.paymentMethod,
    paymentGateway: transaction.paymentGateway,
    transactionHash: transaction.transactionHash,
    description: transaction.description,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  };
}

export async function getWallet(userId: string) {
  await connectMongo();
  return Wallet.findOne({ userId: mongoId(userId, "user id") });
}

export async function getOrCreateWallet(userId: string): Promise<WalletResponse> {
  await connectMongo();
  const userObjectId = mongoId(userId, "user id");
  const wallet = await Wallet.findOneAndUpdate(
    { userId: userObjectId },
    { $setOnInsert: { userId: userObjectId } },
    { new: true, upsert: true }
  );

  return serializeWallet(wallet);
}

export async function createFundingTransaction(input: {
  userId: string;
  amount: number;
  paymentMethod: string;
  paymentGateway: PaymentGatewayId;
}): Promise<TransactionResponse> {
  await connectMongo();
  const userObjectId = mongoId(input.userId, "user id");
  const wallet = await Wallet.findOneAndUpdate(
    { userId: userObjectId },
    { $setOnInsert: { userId: userObjectId } },
    { new: true, upsert: true }
  );
  const amountCents = centsFromAmount(input.amount);

  const transaction = await Transaction.create({
    userId: userObjectId,
    walletId: wallet._id,
    type: "DEPOSIT",
    status: "PENDING",
    amountCents,
    feeCents: 0,
    netAmountCents: amountCents,
    reference: reference("fund"),
    paymentMethod: input.paymentMethod,
    paymentGateway: input.paymentGateway,
    description: "Wallet funding"
  });

  return serializeTransaction(transaction);
}

export async function completeTransactionByReference(input: {
  reference: string;
  transactionHash?: string;
  gatewayReference?: string;
}): Promise<TransactionResponse> {
  await connectMongo();
  const transaction = await Transaction.findOne({ reference: input.reference });
  if (!transaction) throw new Error("Transaction not found");

  if (transaction.status === "COMPLETED") return serializeTransaction(transaction);
  if (transaction.status !== "PENDING") throw new Error(`Cannot complete a ${transaction.status} transaction`);

  await Wallet.updateOne(
    { _id: transaction.walletId },
    { $inc: { balanceCents: transaction.netAmountCents, totalDepositedCents: transaction.netAmountCents } }
  );

  transaction.status = "COMPLETED";
  transaction.transactionHash = input.transactionHash || null;
  transaction.gatewayReference = input.gatewayReference || null;
  await transaction.save();

  return serializeTransaction(transaction);
}

export async function failTransactionByReference(transactionReference: string, failureReason?: string): Promise<TransactionResponse> {
  await connectMongo();
  const transaction = await Transaction.findOne({ reference: transactionReference });
  if (!transaction) throw new Error("Transaction not found");

  if (transaction.status === "PENDING") {
    transaction.status = "FAILED";
    transaction.failureReason = failureReason || null;
    await transaction.save();
  }

  return serializeTransaction(transaction);
}

export async function deductForOrder(userId: string, orderId: string, amount: number, fee = 0): Promise<TransactionResponse> {
  await connectMongo();
  const userObjectId = mongoId(userId, "user id");
  const orderObjectId = mongoId(orderId, "order id");
  const amountCents = centsFromAmount(amount);
  const feeCents = Math.max(Math.round(Number(fee || 0) * 100), 0);
  const totalCents = amountCents + feeCents;

  const wallet = await Wallet.findOneAndUpdate(
    { userId: userObjectId, balanceCents: { $gte: totalCents } },
    { $inc: { balanceCents: -totalCents } },
    { new: true }
  );

  if (!wallet) {
    throw new Error("Insufficient balance");
  }

  const transaction = await Transaction.create({
    userId: userObjectId,
    walletId: wallet._id,
    orderId: orderObjectId,
    type: "ORDER_PAYMENT",
    status: "COMPLETED",
    amountCents,
    feeCents,
    netAmountCents: amountCents,
    reference: `ORDER-${orderId}`,
    description: `Payment for order ${orderId}`
  });

  return serializeTransaction(transaction);
}

export async function refundOrder(orderId: string): Promise<TransactionResponse> {
  await connectMongo();
  const orderObjectId = mongoId(orderId, "order id");
  const existingTransaction = await Transaction.findOne({
    orderId: orderObjectId,
    type: "ORDER_PAYMENT",
    status: "COMPLETED"
  });

  if (!existingTransaction) throw new Error("Order payment not found");

  await Wallet.updateOne(
    { _id: existingTransaction.walletId },
    { $inc: { balanceCents: existingTransaction.netAmountCents } }
  );

  const refundTx = await Transaction.create({
    userId: existingTransaction.userId,
    walletId: existingTransaction.walletId,
    orderId: orderObjectId,
    type: "REFUND",
    status: "COMPLETED",
    amountCents: existingTransaction.netAmountCents,
    feeCents: 0,
    netAmountCents: existingTransaction.netAmountCents,
    reference: reference(`refund_${orderId}`),
    description: `Refund for order ${orderId}`,
    reversalOfId: existingTransaction._id
  });

  return serializeTransaction(refundTx);
}

export async function getTransactionHistory(filter: {
  userId: string;
  type?: TransactionType;
  status?: TransactionStatus;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; transactions: TransactionResponse[] }> {
  await connectMongo();
  const query: Record<string, unknown> = { userId: mongoId(filter.userId, "user id") };

  if (filter.type) query.type = filter.type;
  if (filter.status) query.status = filter.status;

  const limit = Math.min(Math.max(filter.limit || 50, 1), 100);
  const offset = Math.max(filter.offset || 0, 0);

  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit),
    Transaction.countDocuments(query)
  ]);

  return { total, transactions: transactions.map(serializeTransaction) };
}
