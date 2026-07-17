import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, hashSecureToken } from "@/lib/auth/security";
import { connectMongo } from "@/lib/mongodb";
import { PasswordResetToken } from "@/models/auth-token";
import { User } from "@/models/user";
import { clientIp, enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(20).max(256),
  password: z.string().min(8).max(128)
});

export async function POST(request: NextRequest) {
  try {
    const input = resetPasswordSchema.parse(await request.json());
    await enforceRateLimit("reset-password", clientIp(request.headers), 10, 60 * 60 * 1000);
    await connectMongo();
    const record = await PasswordResetToken.findOne({ token: { $in: [hashSecureToken(input.token), input.token] } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    await User.updateOne(
      { _id: record.userId },
      {
        $set: {
          passwordHash: await hashPassword(input.password),
          lastPasswordChangeAt: new Date()
        }
      }
    );
    record.usedAt = new Date();
    await record.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
