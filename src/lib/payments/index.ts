import type { CreatePaymentIntentRequest, PaymentGateway, PaymentGatewayId, PaymentIntent, PaymentWebhookResult } from "./types";
import { PocketFiGateway } from "./gateways/pocketfi-gateway";

const gateways: Record<PaymentGatewayId, PaymentGateway> = {
  pocketfi: new PocketFiGateway()
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