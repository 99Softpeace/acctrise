import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth/request";
import { hasRole } from "@/lib/auth/roles";
import { connectMongo } from "@/lib/mongodb";
import { Transaction } from "@/models/transaction";
import { User } from "@/models/user";
import { Wallet } from "@/models/wallet";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["active", "banned"])
});

async function requireAdmin(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!hasRole(user.role, "ADMIN")) return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

function moneyFromCents(cents: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Math.max(cents, 0) / 100);
}

function serializeUser(user: any, wallet?: any) {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
    role: user.role,
    status: user.status,
    balance: moneyFromCents(wallet?.balanceCents || 0),
    joinedAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  await connectMongo();

  const [totalUsers, activeUsers, bannedUsers, orderPayments, refunds, users] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "banned" }),
    Transaction.aggregate([
      { $match: { type: "ORDER_PAYMENT", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$netAmountCents" } } }
    ]),
    Transaction.aggregate([
      { $match: { type: "REFUND", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$netAmountCents" } } }
    ]),
    User.find({}).sort({ createdAt: -1 }).limit(100).lean()
  ]);

  const walletRows = await Wallet.find({ userId: { $in: users.map((user) => user._id) } }).lean();
  const walletByUser = new Map(walletRows.map((wallet) => [wallet.userId.toString(), wallet]));
  const revenueCents = Number(orderPayments[0]?.total || 0) - Number(refunds[0]?.total || 0);

  return NextResponse.json({
    success: true,
    stats: {
      revenue: moneyFromCents(revenueCents),
      revenueCents,
      totalUsers,
      activeUsers,
      bannedUsers
    },
    users: users.map((user) => serializeUser(user, walletByUser.get(user._id.toString())))
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  const input = updateUserSchema.parse(await request.json());
  if (auth.user?.id === input.userId) {
    return NextResponse.json({ error: "You cannot change your own admin status." }, { status: 400 });
  }

  await connectMongo();
  const user = await User.findByIdAndUpdate(input.userId, { $set: { status: input.status } }, { new: true });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const wallet = await Wallet.findOne({ userId: user._id }).lean();
  return NextResponse.json({ success: true, user: serializeUser(user, wallet) });
}