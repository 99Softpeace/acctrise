import type { OrderRequest, OrderResponse, ProviderConfig, ServiceMapping } from "../base-adapter";
import { SMSPoolAdapter } from "./sms-pool-adapter";

export class SMSPoolEsimAdapter extends SMSPoolAdapter {
  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    super(providerId, config, logger);
  }

  async fetchServices(): Promise<ServiceMapping[]> {
    return this.fetchEsimServices();
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    const info = request.additionalInfo;
    if (!info || typeof info !== "object" || Array.isArray(info) || info.kind !== "esim") {
      throw new Error("SMSPool is restricted to eSIM orders.");
    }
    return super.placeOrder(request);
  }
}
