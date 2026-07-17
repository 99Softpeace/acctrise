import { connectMongo } from "@/lib/mongodb";
import { mongoId } from "@/lib/services/mongo-wallet-service";
import { User } from "@/models/user";
import { VirtualAccount } from "@/models/virtual-account";

function object(value: unknown): Record<string, any> { return value && typeof value === "object" ? value as Record<string, any> : {}; }
export function serializeVirtualAccount(row: any) { return { id: row._id.toString(), accountName: row.accountName, accountNumber: row.accountNumber, bankName: row.bankName, bankCode: row.bankCode || null }; }

export async function provisionVirtualAccount(userIdValue: string, bank = "kuda") {
  await connectMongo();
  const userId = mongoId(userIdValue, "user id");
  const existing = await VirtualAccount.findOne({ userId });
  if (existing) return existing;
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found.");
  if (!user.firstName || !user.lastName || !user.email) throw new Error("Your account profile is incomplete. Contact support to finish dedicated-account setup.");
  const providerPhone = process.env.POCKETFI_FALLBACK_PHONE?.trim();
  if (!providerPhone) throw new Error("PocketFi requires a server-side business phone. Configure POCKETFI_FALLBACK_PHONE.");
  const token = process.env.POCKETFI_PUBLIC_KEY?.trim();
  const businessId = process.env.POCKETFI_BUSINESS_ID?.trim();
  if (!token || !businessId) throw new Error("PocketFi virtual accounts are not configured.");
  const base = (process.env.POCKETFI_BASE_URL || "https://api.pocketfi.ng/api/v1").replace(/\/$/, "");
  const response = await fetch(`${base}/virtual-accounts/create`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ first_name: user.firstName, last_name: user.lastName, phone: providerPhone, email: user.email, businessId, bank }) });
  const body = object(await response.json().catch(() => ({})));
  if (!response.ok || body.status === false) throw new Error(body.message || "PocketFi could not create the virtual account.");
  const bankResult = Array.isArray(body.banks) ? object(body.banks[0]) : {};
  const data = object(body.data || body.account || body.virtual_account || bankResult || body);
  const accountNumber = data.account_number || data.accountNumber || data.number || body.account_number;
  const accountName = data.account_name || data.accountName || data.name || `${user.firstName} ${user.lastName}`;
  const bankName = data.bank_name || data.bankName || data.bank || bank;
  if (!accountNumber) throw new Error("PocketFi created the account but did not return an account number. Contact support before retrying.");
  return VirtualAccount.findOneAndUpdate({ userId }, { $setOnInsert: { userId, accountName: String(accountName), accountNumber: String(accountNumber), bankName: String(bankName), bankCode: data.bank_code || data.bankCode || null, providerReference: data.id || data.reference || null } }, { upsert: true, returnDocument: "after" });
}