import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/security";
import { connectMongo } from "@/lib/mongodb";
import { PasswordResetToken } from "@/models/auth-token";
import { User } from "@/models/user";

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8)
});

export async function POST(request: NextRequest) {
  try {
    const input = resetPasswordSchema.parse(await request.json());
    await connectMongo();
    const record = await PasswordResetToken.findOne({ token: input.token });

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
