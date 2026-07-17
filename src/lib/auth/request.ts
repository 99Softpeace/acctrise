import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/types/auth";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/user";

export interface RequestUser {
  id: string;
  role: UserRole;
  email?: string | null;
}

export async function getRequestUser(request: NextRequest): Promise<RequestUser | null> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return null;

  await connectMongo();
  const user = await User.findById(token.id).select("_id email role status").lean();
  if (!user || user.status !== "active") return null;
  return { id: user._id.toString(), role: user.role as UserRole, email: user.email };
}

export async function getRequestUserId(request: NextRequest): Promise<string | null> {
  return (await getRequestUser(request))?.id || null;
}
