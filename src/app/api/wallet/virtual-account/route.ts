import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth/request";
import { connectMongo } from "@/lib/mongodb";
import { mongoId } from "@/lib/services/mongo-wallet-service";
import { provisionVirtualAccount, serializeVirtualAccount } from "@/lib/payments/virtual-account-service";
import { User } from "@/models/user";
import { VirtualAccount } from "@/models/virtual-account";

const profileSchema = z.object({ firstName: z.string().trim().min(2).max(80).optional(), lastName: z.string().trim().min(2).max(80).optional() });
function missingProfile(user: any) { return { firstName: !user?.firstName, lastName: !user?.lastName }; }
export async function GET(request: NextRequest) {
  const auth = await getRequestUser(request); if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectMongo(); const userId = mongoId(auth.id, "user id"); const [row, user] = await Promise.all([VirtualAccount.findOne({ userId }), User.findById(userId).lean()]);
  return NextResponse.json({ success: true, account: row ? serializeVirtualAccount(row) : null, missingProfile: missingProfile(user) });
}
export async function POST(request: NextRequest) {
  try {
    const auth = await getRequestUser(request); if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = profileSchema.parse(await request.json().catch(() => ({}))); await connectMongo(); const userId = mongoId(auth.id, "user id"); const user = await User.findById(userId); if (!user) throw new Error("User not found.");
    if (!user.firstName && input.firstName) user.firstName = input.firstName;
    if (!user.lastName && input.lastName) user.lastName = input.lastName;
    if (user.isModified()) await user.save();
    const missing = missingProfile(user); if (missing.firstName || missing.lastName) return NextResponse.json({ error: "Complete the missing profile details first.", missingProfile: missing }, { status: 409 });
    const row = await provisionVirtualAccount(auth.id); return NextResponse.json({ success: true, account: serializeVirtualAccount(row) }, { status: 201 });
  } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Enter valid profile details." }, { status: 400 }); return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to provision virtual account." }, { status: 500 }); }
}