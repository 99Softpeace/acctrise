import type { CreatePaymentIntentRequest, PaymentGateway, PaymentGatewayId, PaymentIntent, PaymentWebhookResult } from "./types";
import { PaystackGateway } from "./gateways/paystack";
import { FlutterwaveGateway } from "./gateways/flutterwave";
import { HeldGateway } from "./gateways/held-gateway";

const gateways: Record<PaymentGatewayId, PaymentGateway> = {
  paystack: new PaystackGateway(),
  flutterwave: new FlutterwaveGateway(),
  crypto: new HeldGateway("crypto"),
  pocketfi: new HeldGateway("pocketfi")
};

export function getPaymentGateway(id: PaymentGatewayId): PaymentGateway {
  return gateways[id];
}

export async function createFundingIntent(
  gatewayId: PaymentGatewayId,
  request: CreatePaymentIntentRequest
): Promise<PaymentIntent> {
  return getPaymentGateway(gatewayId).createFundingIntent(request);
}

export async function parsePaymentWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookResult | null> {
  for (const gateway of Object.values(gateways)) {
    const result = await gateway.parseWebhook(rawBody, headers);
    if (result) return result;
  }

  return null;
}

export type { PaymentGatewayId, PaymentIntent, PaymentWebhookResult } from "./types";
