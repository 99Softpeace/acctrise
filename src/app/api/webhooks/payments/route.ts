/**
 * Payment Webhook Handler
 * POST /api/webhooks/payments
 */

import { after, NextRequest, NextResponse } from "next/server";
import { parsePaymentWebhook } from "@/lib/payments";
import { reconcilePocketFiVirtualAccounts } from "@/lib/payments/virtual-account-reconciliation";
import { completeTransactionByReference, failTransactionByReference } from "@/lib/services/mongo-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhook = await parsePaymentWebhook(body, request.headers);

    if (!webhook) {
      return NextResponse.json({ success: true, ignored: true });
    }

    if (webhook.status === "COMPLETED") {
      after(async () => {
        try {
          await completeTransactionByReference({
            reference: webhook.reference,
            transactionHash: webhook.transactionHash,
            gatewayReference: webhook.providerReference,
            paidAmount: webhook.amount
          });
        } catch (error) {
          if (!(error instanceof Error) || error.message !== "Transaction not found") {
            console.error("PocketFi webhook processing failed", error);
            return;
          }
          try {
            await reconcilePocketFiVirtualAccounts();
          } catch (reconciliationError) {
            console.error("PocketFi virtual-account reconciliation failed", reconciliationError);
          }
        }
      });
      return NextResponse.json({ success: true, accepted: true });
    }

    if (webhook.status === "FAILED") {
      after(async () => {
        try {
          await failTransactionByReference(webhook.reference, webhook.failureReason);
        } catch (error) {
          console.error("PocketFi failed-payment webhook processing failed", error);
        }
      });
      return NextResponse.json({ success: true, accepted: true });
    }

    return NextResponse.json({ success: true, pending: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}
