import type { CreatePaymentIntentRequest, PaymentGateway, PaymentIntent, PaymentWebhookResult } from "../types";

export class HeldGateway implements PaymentGateway {
  constructor(public id: "pocketfi") {}

  async createFundingIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    return {
      gateway: this.id,
      reference: request.reference,
      status: "pending",
      message: `${this.id} funding architecture is ready, but provider activation is on hold.`
    };
  }

  async parseWebhook(): Promise<PaymentWebhookResult | null> {
    return null;
  }
}
