import crypto from "crypto";
import type { CreatePaymentIntentRequest, PaymentGateway, PaymentIntent, PaymentWebhookResult } from "../types";

export class FlutterwaveGateway implements PaymentGateway {
  id = "flutterwave" as const;

  async createFundingIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) {
      return {
        gateway: this.id,
        reference: request.reference,
        status: "requires_configuration",
        message: "FLUTTERWAVE_SECRET_KEY is not configured."
      };
    }

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tx_ref: request.reference,
        amount: request.amount,
        currency: request.currency,
        redirect_url: request.callbackUrl,
        customer: { email: request.email || process.env.PAYMENT_FALLBACK_EMAIL || "billing@acctrise.com" },
        customizations: { title: "Acctrise wallet funding" },
        meta: request.metadata
      })
    });

    const payload = await response.json();
    if (!response.ok || payload.status !== "success") {
      throw new Error(payload.message || "Flutterwave initialization failed");
    }

    return {
      gateway: this.id,
      reference: request.reference,
      status: "ready",
      authorizationUrl: payload.data?.link,
      providerReference: payload.data?.id?.toString()
    };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookResult | null> {
    const signature = headers.get("verif-hash");
    if (!signature) return null;

    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET || process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) throw new Error("FLUTTERWAVE_WEBHOOK_SECRET or FLUTTERWAVE_SECRET_KEY is not configured.");

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const isDirectHash = signature === secret;
    if (!isDirectHash && expected !== signature) throw new Error("Invalid Flutterwave signature");

    const payload = JSON.parse(rawBody);
    const reference = payload.data?.tx_ref || payload.data?.txRef;
    if (!reference) return null;

    return {
      gateway: this.id,
      reference,
      status: payload.data?.status === "successful" || payload.status === "success" ? "COMPLETED" : payload.data?.status === "failed" ? "FAILED" : "PENDING",
      providerReference: payload.data?.id?.toString(),
      failureReason: payload.data?.processor_response
    };
  }
}
