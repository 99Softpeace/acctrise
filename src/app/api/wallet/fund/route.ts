/**
 * Wallet Fund API Route
 * POST /api/wallet/fund
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUserId } from "@/lib/auth/request";
import { createFundingTransaction } from "@/lib/services/mongo-wallet-service";
import { createFundingIntent } from "@/lib/payments";

const fundWalletSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.string().min(2),
  paymentGateway: z.literal("pocketfi"),
  email: z.string().email().optional(),
  callbackUrl: z.string().url().optional()
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validatedData = fundWalletSchema.parse(await request.json());
    const transaction = await createFundingTransaction({
      userId,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      paymentGateway: validatedData.paymentGateway
    });

    const payment = await createFundingIntent(validatedData.paymentGateway, {
      reference: transaction.reference || transaction.id,
      amount: validatedData.amount,
      currency: "NGN",
      email: validatedData.email,
      callbackUrl: validatedData.callbackUrl,
      metadata: { userId, transactionId: transaction.id }
    });

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status,
          gateway: transaction.paymentGateway
        },
        payment
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
