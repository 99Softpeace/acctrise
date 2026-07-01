/**
 * BulkAcc Logs Provider Adapter
 * Handles account logs and bulk account services
 */

import { BaseProviderAdapter, ProviderConfig, OrderRequest, OrderResponse, OrderStatus, ServiceMapping, ProviderHealth } from "../base-adapter";
import axios, { AxiosInstance } from "axios";

interface BulkAccServiceResponse {
  id: string;
  name: string;
  category: string;
  price: number;
  minOrder?: number;
  maxOrder?: number;
}

interface BulkAccOrderResponse {
  orderId: string;
  status: string;
  accounts?: Array<{
    username: string;
    password: string;
    email: string;
    other?: Record<string, string>;
  }>;
  message?: string;
}

export class BulkAccAdapter extends BaseProviderAdapter {
  private client: AxiosInstance;
  private baseUrl = "https://api.bulkacc.com";

  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    super(providerId, config, logger);

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      }
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.client.get("/v1/account/balance");

      if (response.status === 200 && response.data.balance !== undefined) {
        this.log("info", "BulkAcc authentication successful");
        return true;
      }
      return false;
    } catch (error) {
      this.log("error", "BulkAcc authentication failed", error);
      return false;
    }
  }

  async fetchServices(): Promise<ServiceMapping[]> {
    try {
      const response = await this.client.get("/v1/services");

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((service: BulkAccServiceResponse) => ({
        externalId: service.id,
        name: service.name,
        price: service.price,
        minOrder: service.minOrder || 1,
        maxOrder: service.maxOrder,
        description: `${service.category} - ${service.name}`
      }));
    } catch (error) {
      this.log("error", "Failed to fetch BulkAcc services", error);
      return [];
    }
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    try {
      const additionalInfo = request.additionalInfo && typeof request.additionalInfo === "object" && !Array.isArray(request.additionalInfo)
        ? request.additionalInfo
        : {};
      const payload = {
        service_id: request.serviceId,
        quantity: request.quantity,
        ...additionalInfo
      };

      const response = await this.client.post("/v1/orders", payload);

      if (response.data.orderId) {
        return {
          externalOrderId: response.data.orderId,
          status: response.data.status || "pending",
          message: "Order placed successfully"
        };
      }

      throw new Error(response.data.error || "Failed to place order");
    } catch (error) {
      this.log("error", "Failed to place BulkAcc order", error);
      throw error;
    }
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderStatus> {
    try {
      const response = await this.client.get(`/v1/orders/${externalOrderId}`);

      if (response.data) {
        const data = response.data;
        return {
          externalOrderId,
          status: this.mapStatus(data.status),
          progress: data.progress || 0,
          message: data.statusMessage || "Processing...",
          lastUpdated: new Date(data.lastUpdated || Date.now())
        };
      }

      throw new Error("Order not found");
    } catch (error) {
      this.log("error", "Failed to check BulkAcc order status", error);
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
        message: isHealthy ? "BulkAcc is operational" : "BulkAcc is unreachable"
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
      const response = await this.client.post(`/v1/orders/${externalOrderId}/refund`, {});

      return response.status === 200 && response.data.success === true;
    } catch (error) {
      this.log("error", "Failed to refund BulkAcc order", error);
      return false;
    }
  }

  async getSupportedPaymentMethods(): Promise<string[]> {
    return ["credit_card", "paypal", "bank_transfer"];
  }

  private mapStatus(providerStatus: string): string {
    const STATUS_MAP: { [key: string]: string } = {
      "pending": "pending",
      "processing": "processing",
      "completed": "completed",
      "failed": "failed",
      "cancelled": "cancelled",
      "refunded": "refunded"
    };
    return STATUS_MAP[providerStatus?.toLowerCase() || ""] || "unknown";
  }
}


