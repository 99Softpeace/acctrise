import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongodb";
import { Transaction } from "@/models/transaction";
import { VirtualAccount } from "@/models/virtual-account";
import { Wallet } from "@/models/wallet";

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? value as Record<string, any> : {};
}

function providerTotalCents(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
}

export async function reconcilePocketFiVirtualAccounts(userId?: string) {
  const token = process.env.POCKETFI_PUBLIC_KEY?.trim();
  const businessId = process.env.POCKETFI_BUSINESS_ID?.trim();
  if (!token || !businessId) return { creditedCents: 0 };
  const base = (process.env.POCKETFI_BASE_URL || "https://api.pocketfi.ng/api/v1").replace(/\/$/, "");
  const url = new URL(`${base}/virtual-accounts/fetch`);
  url.searchParams.set("businessId", businessId);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" });
  const body = record(await response.json().catch(() => ({})));
  if (!response.ok || body.status === false) throw new Error(body.message || "Unable to reconcile virtual-account funding.");

  const providerRows = (Array.isArray(body.accounts) ? body.accounts : [])
    .map(record)
    .map((row) => ({
      row,
      accountNumber: String(row.account || row.accountNumber || row.account_number || ""),
      totalCents: providerTotalCents(row.total_fund)
    }))
    .filter(({ accountNumber, totalCents }) => accountNumber && totalCents > 0);
  if (!providerRows.length) return { creditedCents: 0 };

  await connectMongo();
  const accountQuery: Record<string, any> = { accountNumber: { $in: providerRows.map(({ accountNumber }) => accountNumber) } };
  if (userId && mongoose.Types.ObjectId.isValid(userId)) accountQuery.userId = new mongoose.Types.ObjectId(userId);
  const virtualAccounts = await VirtualAccount.find(accountQuery);
  const virtualAccountByNumber = new Map(virtualAccounts.map((account) => [account.accountNumber, account]));

  let creditedCents = 0;
  for (const { row: providerRow, accountNumber, totalCents } of providerRows) {
    const virtualAccount = virtualAccountByNumber.get(accountNumber);
    if (!virtualAccount || totalCents <= (virtualAccount.creditedCents || 0)) continue;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const current = await VirtualAccount.findOne({ _id: virtualAccount._id }).session(session);
        if (!current) return;
        const previousCents = current.creditedCents || 0;
        const deltaCents = totalCents - previousCents;
        if (deltaCents <= 0) return;
        const wallet = await Wallet.findOneAndUpdate({ userId: current.userId }, { $setOnInsert: { userId: current.userId }, $inc: { balanceCents: deltaCents, totalDepositedCents: deltaCents } }, { new: true, upsert: true, session });
        await Transaction.create([{ userId: current.userId, walletId: wallet._id, type: "TRANSFER_IN", status: "COMPLETED", amountCents: deltaCents, feeCents: 0, netAmountCents: deltaCents, reference: `pocketfi_va_${providerRow.id || accountNumber}_${totalCents}`, paymentMethod: "virtual_account", paymentGateway: "pocketfi", description: "Virtual account funding", metadata: { providerAccountId: providerRow.id, totalFundCents: totalCents } }], { session });
        current.creditedCents = totalCents;
        await current.save({ session });
        creditedCents += deltaCents;
      });
    } finally {
      await session.endSession();
    }
  }
  return { creditedCents };
}
