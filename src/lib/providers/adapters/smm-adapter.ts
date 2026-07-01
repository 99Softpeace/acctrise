/**
 * SMM Panel Provider Adapter
 * Handles social media services (Instagram, TikTok, Telegram, etc.)
 */

import { BaseProviderAdapter, ProviderConfig, OrderRequest, OrderResponse, OrderStatus, ServiceMapping, ProviderHealth } from "../base-adapter";
import axios, { AxiosInstance } from "axios";

interface SMMServiceResponse {
  service: number;
  name: string;
  category: string;
  rate: number;
  min: number;
  max: number;
  dripfeed: number;
  refill: number;
  cancel: number;
}

interface SMMOrderResponse {
  order: string | number;
  charge: number;
  startCount: number;
  status: number;
}

export class ResellingSMMAdapter extends BaseProviderAdapter {
  private client: AxiosInstance;
  private baseUrl = "https://api.resellersms.com";

  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    super(providerId, config, logger);

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/v2/user", {
        params: {
          api_key: this.config.apiKey
        }
      });

      if (response.status === 200 && response.data.balance !== undefined) {
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
    try {
      const response = await this.client.get("/api/v2/services", {
        params: {
          api_key: this.config.apiKey
        }
      });

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((service: SMMServiceResponse) => ({
        externalId: service.service.toString(),
        name: service.name,
        price: service.rate,
        minOrder: service.min,
        maxOrder: service.max,
        description: `${service.category} - ${service.service}`
      }));
    } catch (error) {
      this.log("error", "Failed to fetch SMM services", error);
      return [];
    }
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    try {
      // Map serviceId to external service ID
      // This would typically come from ProviderService mapping
      const externalServiceId = request.serviceId;

      const orderParams: any = {
        api_key: this.config.apiKey,
        action: "add",
        service: externalServiceId,
        link: request.targetUrl,
        quantity: request.quantity
      };

      // Optional parameters
      if (request.targetUsername) {
        orderParams.username = request.targetUsername;
      }
      if (request.additionalInfo) {
        Object.assign(orderParams, request.additionalInfo);
      }

      const response = await this.client.get("/api/v2/orders", {
        params: orderParams
      });

      if (response.data.order) {
        return {
          externalOrderId: response.data.order.toString(),
          status: "pending",
          message: "Order placed successfully"
        };
      }

      throw new Error(response.data.error || "Failed to place order");
    } catch (error) {
      this.log("error", "Failed to place SMM order", error);
      throw error;
    }
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderStatus> {
    try {
      const response = await this.client.get("/api/v2/orders", {
        params: {
          api_key: this.config.apiKey,
          action: "status",
          order: externalOrderId
        }
      });

      if (response.data.order) {
        const data = response.data;
        return {
          externalOrderId,
          status: this.mapStatus(data.order_status),
          progress: data.startCount ? Math.floor((data.start_count / data.quantity) * 100) : 0,
          message: data.order_status === "Completed" ? "Order delivered" : "Processing...",
          lastUpdated: new Date()
        };
      }

      throw new Error(response.data.error || "Failed to check order status");
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
      const response = await this.client.get("/api/v2/orders", {
        params: {
          api_key: this.config.apiKey,
          action: "refund",
          order: externalOrderId
        }
      });

      return response.status === 200 && response.data.cancel === 200;
    } catch (error) {
      this.log("error", "Failed to refund order", error);
      return false;
    }
  }

  async getSupportedPaymentMethods(): Promise<string[]> {
    return ["credit_card", "paypal", "crypto"];
  }

  private mapStatus(providerStatus: string): string {
    const STATUS_MAP: { [key: string]: string } = {
      "Pending": "pending",
      "Completed": "completed",
      "Canceled": "cancelled",
      "Refunded": "refunded",
      "Active": "processing"
    };
    return STATUS_MAP[providerStatus] || "unknown";
  }
}

