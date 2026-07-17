import { createHmac, timingSafeEqual } from "crypto";
import type { CreatePaymentIntentRequest, PaymentGateway, PaymentIntent, PaymentWebhookResult } from "../types";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? value as Record<string, any> : {};
}

export class PocketFiGateway implements PaymentGateway {
  public id = "pocketfi" as const;

  async createFundingIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    const token = required("POCKETFI_PUBLIC_KEY");
    const businessId = required("POCKETFI_BUSINESS_ID");
    const baseUrl = (process.env.POCKETFI_BASE_URL || "https://api.pocketfi.ng/api/v1").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/checkout/request`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: request.firstName || "Acctrise",
        last_name: request.lastName || "Customer",
        phone: request.phone,
        business_id: businessId,
        email: request.email,
        redirect_link: request.callbackUrl,
        amount: request.amount.toFixed(2),
        reference: request.reference,
        metadata: request.metadata
      })
    });
    const body = record(await response.json().catch(() => ({})));
    if (!response.ok || body.status === false) throw new Error(body.message || "PocketFi could not initialize payment.");
    const data = record(body.data || body);
    const authorizationUrl = data.payment_link || data.checkout_url || data.payment_url || data.authorization_url || data.url || data.link;
    const providerReference = data.payment_id || data.reference || data.transaction?.reference;
    if (!authorizationUrl) throw new Error("PocketFi did not return a checkout URL.");
    return { gateway: this.id, reference: request.reference, status: "ready", authorizationUrl: String(authorizationUrl), providerReference: providerReference ? String(providerReference) : undefined };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookResult | null> {
    const signature = headers.get("pocketfi-signature") || headers.get("http_pocketfi_signature") || headers.get("http-pocketfi-signature");
    if (!signature) return null;
    const expected = createHmac("sha512", required("POCKETFI_SECRET_KEY")).update(rawBody).digest("hex");
    const received = signature.trim().toLowerCase();
    if (received.length !== expected.length || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) throw new Error("Invalid PocketFi webhook signature.");
    const payload = record(JSON.parse(rawBody));
    const transaction = record(payload.transaction);
    const order = record(payload.order);
    const reference = transaction.reference || payload.reference;
    if (!reference) throw new Error("PocketFi webhook reference is missing.");
    const rawStatus = String(transaction.status || payload.status || payload.event || "completed").toLowerCase();
    const status = /fail|cancel|reverse|refund/.test(rawStatus) ? "FAILED" : /pending|process/.test(rawStatus) ? "PENDING" : "COMPLETED";
    return { gateway: this.id, reference: String(reference), status, providerReference: transaction.payment_id ? String(transaction.payment_id) : undefined, transactionHash: transaction.transaction_hash ? String(transaction.transaction_hash) : undefined, failureReason: status === "FAILED" ? String(payload.message || rawStatus) : undefined, amount: Number(order.amount) };
  }
}