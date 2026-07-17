/**
 * Payment Webhook Handler
 * POST /api/webhooks/payments
 */

import { NextRequest, NextResponse } from "next/server";
import { parsePaymentWebhook } from "@/lib/payments";
import { completeTransactionByReference, failTransactionByReference } from "@/lib/services/mongo-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhook = await parsePaymentWebhook(body, request.headers);

    if (!webhook) {
      return NextResponse.json({ success: true, ignored: true });
    }

    if (webhook.status === "COMPLETED") {
      const transaction = await completeTransactionByReference({
        reference: webhook.reference,
        transactionHash: webhook.transactionHash,
        gatewayReference: webhook.providerReference,
        paidAmount: webhook.amount
      });

      return NextResponse.json({ success: true, transactionId: transaction.id });
    }

    if (webhook.status === "FAILED") {
      const transaction = await failTransactionByReference(
        webhook.reference,
        webhook.failureReason
      );

      return NextResponse.json({ success: true, transactionId: transaction.id });
    }

    return NextResponse.json({ success: true, pending: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}
