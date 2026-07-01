import crypto from "crypto";
import type { CreatePaymentIntentRequest, PaymentGateway, PaymentIntent, PaymentWebhookResult } from "../types";

export class PaystackGateway implements PaymentGateway {
  id = "paystack" as const;

  async createFundingIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return {
        gateway: this.id,
        reference: request.reference,
        status: "requires_configuration",
        message: "PAYSTACK_SECRET_KEY is not configured."
      };
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: request.email || process.env.PAYMENT_FALLBACK_EMAIL || "billing@acctrise.com",
        amount: Math.round(request.amount * 100),
        currency: request.currency,
        reference: request.reference,
        callback_url: request.callbackUrl,
        metadata: request.metadata
      })
    });

    const payload = await response.json();
    if (!response.ok || !payload.status) {
      throw new Error(payload.message || "Paystack initialization failed");
    }

    return {
      gateway: this.id,
      reference: request.reference,
      status: "ready",
      authorizationUrl: payload.data?.authorization_url,
      providerReference: payload.data?.access_code
    };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookResult | null> {
    const signature = headers.get("x-paystack-signature");
    if (!signature) return null;

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured.");

    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (hash !== signature) throw new Error("Invalid Paystack signature");

    const payload = JSON.parse(rawBody);
    const reference = payload.data?.reference;
    if (!reference) return null;

    return {
      gateway: this.id,
      reference,
      status: payload.event === "charge.success" ? "COMPLETED" : payload.event === "charge.failed" ? "FAILED" : "PENDING",
      providerReference: payload.data?.id?.toString(),
      transactionHash: payload.data?.authorization?.authorization_code,
      failureReason: payload.data?.gateway_response
    };
  }
}
