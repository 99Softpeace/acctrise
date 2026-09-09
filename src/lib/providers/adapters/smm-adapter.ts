/**
 * SMM Panel Provider Adapter
 * Handles social media services (Instagram, TikTok, Telegram, etc.)
 */

import { BaseProviderAdapter, ProviderConfig, OrderRequest, OrderResponse, OrderStatus, ServiceMapping, ProviderHealth } from "../base-adapter";
import axios, { AxiosInstance } from "axios";
import { createHash } from "node:crypto";
import { getCachedLiveValue } from "../../cache/live-service-cache";

interface SMMServiceResponse {
  service: number | string;
  name: string;
  category: string;
  rate: number | string;
  min: number | string;
  max: number | string;
  refill?: boolean | number;
  cancel?: boolean | number;
}

export class ResellingSMMAdapter extends BaseProviderAdapter {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    super(providerId, config, logger);

    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl();

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.request({ action: "balance" });

      if (response.status === 200 && response.data?.balance !== undefined) {
        this.log("info", "SMM Panel authentication successful");
        return true;
      }
      return false;
    } catch (error) {
      this.log("error", "SMM Panel authentication failed", error);
      return false;
    }
  }

  async fetchServices(): Promise<ServiceMapping[]> {
    const catalogKey = createHash("sha256").update(`${this.baseUrl}\n${this.config.apiKey}`).digest("hex");
    return getCachedLiveValue(`smm-catalog:${catalogKey}`, 60_000, () => this.loadServices());
  }

  private async loadServices(): Promise<ServiceMapping[]> {
    try {
      const response = await this.request({ action: "services" });

      if (!Array.isArray(response.data)) {
        throw new Error(response.data?.error || "JustAnotherPanel services response was not an array.");
      }

      return response.data.map((service: SMMServiceResponse) => ({
        externalId: String(service.service),
        name: service.name,
        price: Number(service.rate || 0),
        minOrder: Number(service.min || 1),
        maxOrder: Number(service.max || 0) || undefined,
        description: `${service.category} - ${service.service}`
      }));
    } catch (error) {
      this.log("error", "Failed to fetch SMM services", error);
      throw error;
    }
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    try {
      const additionalInfo = request.additionalInfo && typeof request.additionalInfo === "object" && !Array.isArray(request.additionalInfo)
        ? request.additionalInfo
        : {};
      if (!request.targetUrl) {
        throw new Error("A target link is required for JustAnotherPanel orders.");
      }

      const response = await this.request({
        action: "add",
        service: request.serviceId,
        link: request.targetUrl,
        quantity: String(request.quantity),
        ...Object.fromEntries(Object.entries(additionalInfo).map(([key, value]) => [key, String(value)]))
      });

      if (response.data?.order) {
        return {
          externalOrderId: String(response.data.order),
          status: "pending",
          message: "Order placed successfully"
        };
      }

      throw new Error(response.data?.error || "Failed to place order");
    } catch (error) {
      this.log("error", "Failed to place SMM order", error);
      throw error;
    }
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderStatus> {
    try {
      const response = await this.request({
        action: "status",
        order: externalOrderId
      });

      if (response.data && !response.data.error) {
        const data = response.data;
        const quantity = Number(data.quantity || 0);
        const remains = Number(data.remains || 0);
        return {
          externalOrderId,
          status: this.mapStatus(String(data.status || "")),
          progress: quantity > 0 ? Math.max(0, Math.min(100, Math.round(((quantity - remains) / quantity) * 100))) : 0,
          message: data.status ? `Order ${data.status}` : "Processing...",
          lastUpdated: new Date()
        };
      }

      throw new Error(response.data?.error || "Failed to check order status");
    } catch (error) {
      this.log("error", "Failed to check order status", error);
      throw error;
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    try {
      const isHealthy = await this.authenticate();
      return {
        isHealthy,
        status: isHealthy ? "active" : "error",
        lastCheck: new Date(),
        message: isHealthy ? "SMM Panel is operational" : "SMM Panel is unreachable"
      };
    } catch (error) {
      return {
        isHealthy: false,
        status: "error",
        lastCheck: new Date(),
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }

  async refundOrder(externalOrderId: string): Promise<boolean> {
    try {
      const response = await this.request({ action: "cancel", orders: externalOrderId });
      return response.status === 200 && !response.data?.error;
    } catch (error) {
      this.log("error", "Failed to cancel order", error);
      return false;
    }
  }

  async getSupportedPaymentMethods(): Promise<string[]> {
    return ["wallet"];
  }

  private async request(values: Record<string, string>) {
    const form = new URLSearchParams({ key: this.config.apiKey, ...values });
    const readOnly = ["services", "balance", "status"].includes(values.action);
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.client.post("/api/v2", form);
      } catch (error) {
        if (!axios.isAxiosError(error)) throw error;
        const transient = ["ECONNABORTED", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(error.code || "") ||
          [502, 503, 504].includes(error.response?.status || 0);
        if (readOnly && transient && attempt === 0) continue;
        // Do not propagate Axios request bodies, which contain the provider key.
        const failure = new Error(transient
          ? "Boosting provider is taking too long to respond. Please try again shortly."
          : "Boosting provider request failed.") as Error & { code?: string; status?: number };
        failure.code = error.code;
        failure.status = error.response?.status;
        throw failure;
      }
    }
  }

  private getDefaultBaseUrl() {
    return "https://justanotherpanel.com";
  }

  private mapStatus(providerStatus: string): string {
    const STATUS_MAP: { [key: string]: string } = {
      "Pending": "pending",
      "Completed": "completed",
      "Canceled": "cancelled",
      "Cancelled": "cancelled",
      "Refunded": "refunded",
      "Active": "processing",
      "In progress": "processing",
      "In Progress": "processing",
      "Processing": "processing",
      "Partial": "processing"
    };
    return STATUS_MAP[providerStatus] || providerStatus.toLowerCase() || "unknown";
  }
}
