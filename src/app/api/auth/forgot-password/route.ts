import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appUrl, sendAuthEmail } from "@/lib/auth/email";
import { addMinutes, createSecureToken, normalizeEmail } from "@/lib/auth/security";
import { connectMongo } from "@/lib/mongodb";
import { PasswordResetToken } from "@/models/auth-token";
import { User } from "@/models/user";

const forgotPasswordSchema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = forgotPasswordSchema.parse(await request.json());
    const email = normalizeEmail(rawEmail);
    await connectMongo();
    const user = await User.findOne({ email });

    if (user) {
      const token = createSecureToken();
      await PasswordResetToken.create({
        userId: user._id,
        token,
        expiresAt: addMinutes(new Date(), 30)
      });

      const resetUrl = appUrl(`/auth/reset-password?token=${token}`);
      await sendAuthEmail({
        to: email,
        subject: "Reset your Acctrise password",
        html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 30 minutes.</p>`
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to process password reset" }, { status: 500 });
  }
}
