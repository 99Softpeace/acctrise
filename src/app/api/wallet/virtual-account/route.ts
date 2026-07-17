import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth/request";
import { connectMongo } from "@/lib/mongodb";
import { mongoId } from "@/lib/services/mongo-wallet-service";
import { User } from "@/models/user";
import { VirtualAccount } from "@/models/virtual-account";

const schema = z.object({ firstName: z.string().min(2).max(80), lastName: z.string().min(2).max(80), phone: z.string().min(7).max(20), bank: z.enum(["saveheaven", "kuda"]) });
function serialize(row: any) { return { id: row._id.toString(), accountName: row.accountName, accountNumber: row.accountNumber, bankName: row.bankName, bankCode: row.bankCode || null }; }
function object(value: unknown): Record<string, any> { return value && typeof value === "object" ? value as Record<string, any> : {}; }

export async function GET(request: NextRequest) {
  const auth = await getRequestUser(request); if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectMongo(); const row = await VirtualAccount.findOne({ userId: mongoId(auth.id, "user id") });
  return NextResponse.json({ success: true, account: row ? serialize(row) : null });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getRequestUser(request); if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = schema.parse(await request.json()); await connectMongo();
    const userId = mongoId(auth.id, "user id"); const existing = await VirtualAccount.findOne({ userId });
    if (existing) return NextResponse.json({ success: true, account: serialize(existing), existing: true });
    const user = await User.findById(userId).lean(); const email = user?.email || auth.email; if (!email) throw new Error("Your account email is required.");
    const token = process.env.POCKETFI_PUBLIC_KEY?.trim(); const businessId = process.env.POCKETFI_BUSINESS_ID?.trim(); if (!token || !businessId) throw new Error("PocketFi virtual accounts are not configured.");
    const base = (process.env.POCKETFI_BASE_URL || "https://api.pocketfi.ng/api/v1").replace(/\/$/, "");
    const response = await fetch(`${base}/virtual-accounts/create`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ first_name: input.firstName, last_name: input.lastName, phone: input.phone, email, businessId, bank: input.bank }) });
    const body = object(await response.json().catch(() => ({}))); if (!response.ok || body.status === false) throw new Error(body.message || "PocketFi could not create the virtual account.");
    const data = object(body.data || body.account || body.virtual_account || body);
    const accountNumber = data.account_number || data.accountNumber || data.number || body.account_number;
    const accountName = data.account_name || data.accountName || data.name || `${input.firstName} ${input.lastName}`;
    const bankName = data.bank_name || data.bankName || data.bank || input.bank;
    if (!accountNumber) throw new Error("PocketFi created the account but did not return an account number. Contact support before retrying.");
    const row = await VirtualAccount.create({ userId, accountName: String(accountName), accountNumber: String(accountNumber), bankName: String(bankName), bankCode: data.bank_code || data.bankCode || null, providerReference: data.id || data.reference || null });
    await User.updateOne({ _id: userId }, { $set: { firstName: input.firstName, lastName: input.lastName } });
    return NextResponse.json({ success: true, account: serialize(row) }, { status: 201 });
  } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid details." }, { status: 400 }); return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create virtual account." }, { status: 500 }); }
}