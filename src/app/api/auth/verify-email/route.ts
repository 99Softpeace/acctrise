import { NextRequest, NextResponse } from "next/server";
import { hashSecureToken } from "@/lib/auth/security";
import { connectMongo } from "@/lib/mongodb";
import { EmailVerificationToken } from "@/models/auth-token";
import { User } from "@/models/user";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?verified=missing", request.url));
    }

    await connectMongo();
    const record = await EmailVerificationToken.findOne({ token: { $in: [hashSecureToken(token), token] } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/auth/login?verified=invalid", request.url));
    }

    await User.updateOne({ _id: record.userId }, { $set: { emailVerified: new Date() } });
    record.usedAt = new Date();
    await record.save();

    return NextResponse.redirect(new URL("/auth/login?verified=success", request.url));
  } catch {
    return NextResponse.redirect(new URL("/auth/login?verified=error", request.url));
  }
}
