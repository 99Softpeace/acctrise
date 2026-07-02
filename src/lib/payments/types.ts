export type PaymentGatewayId = "pocketfi";
export type PaymentIntentStatus = "pending" | "requires_configuration" | "ready";
export type PaymentWebhookStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface CreatePaymentIntentRequest {
  reference: string;
  amount: number;
  currency: string;
  email?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntent {
  gateway: PaymentGatewayId;
  reference: string;
  status: PaymentIntentStatus;
  authorizationUrl?: string;
  providerReference?: string;
  message?: string;
}

export interface PaymentWebhookResult {
  gateway: PaymentGatewayId;
  reference: string;
  status: PaymentWebhookStatus;
  providerReference?: string;
  transactionHash?: string;
  failureReason?: string;
}

export interface PaymentGateway {
  id: PaymentGatewayId;
  createFundingIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent>;
  parseWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookResult | null>;
}
