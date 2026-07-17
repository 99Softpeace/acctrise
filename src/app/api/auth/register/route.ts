import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appUrl, sendAuthEmail } from "@/lib/auth/email";
import { addMinutes, createSecureToken, hashPassword, normalizeEmail, usernameFromEmail } from "@/lib/auth/security";
import { connectMongo } from "@/lib/mongodb";
import { provisionVirtualAccount } from "@/lib/payments/virtual-account-service";
import { EmailVerificationToken } from "@/models/auth-token";
import { User } from "@/models/user";
import { Wallet } from "@/models/wallet";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional()
});

async function uniqueUsername(email: string): Promise<string> {
  const base = usernameFromEmail(email);
  let username = base;
  let attempt = 0;

  while (await User.exists({ username })) {
    attempt += 1;
    username = `${base}${attempt}`.slice(0, 30);
  }

  return username;
}

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    await connectMongo();
    const email = normalizeEmail(input.email);
    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const token = createSecureToken();
    const passwordHash = await hashPassword(input.password);
    const user = await User.create({
      email,
      username: await uniqueUsername(email),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName
    });

    await Promise.all([
      Wallet.create({ userId: user._id }),
      EmailVerificationToken.create({
        userId: user._id,
        token,
        expiresAt: addMinutes(new Date(), 60 * 24)
      })
    ]);

    let virtualAccountReady = true;
    try { await provisionVirtualAccount(user._id.toString()); } catch (error) { virtualAccountReady = false; console.error("[register/virtual-account]", error instanceof Error ? error.message : "Provisioning failed"); }

    const verifyUrl = appUrl(`/api/auth/verify-email?token=${token}`);
    await sendAuthEmail({
      to: email,
      subject: "Verify your Acctrise email",
      html: `<p>Welcome to Acctrise.</p><p><a href="${verifyUrl}">Verify your email</a></p><p>This link expires in 24 hours.</p>`
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role
        },
        virtualAccountReady
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}
