/**
 * SMS Pool Provider Adapter
 * Handles virtual numbers for SMS verification
 */

import { BaseProviderAdapter, ProviderConfig, OrderRequest, OrderResponse, OrderStatus, ServiceMapping, ProviderHealth } from "../base-adapter";
import axios, { AxiosInstance } from "axios";

interface SMSPoolServiceResponse {
  id: number;
  name: string;
  country: string;
  price: number;
}

interface SMSPoolNumberResponse {
  id: number;
  number: string;
  country: string;
  service: string;
  expiry: number;
}

interface SMSPoolSMSResponse {
  id: number;
  from: string;
  to: string;
  body: string;
  date: number;
  code?: string;
}

export class SMSPoolAdapter extends BaseProviderAdapter {
  private client: AxiosInstance;
  private baseUrl = "https://api.smspool.net";

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
      const response = await this.client.get("/user/balance", {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        }
      });

      if (response.status === 200 && response.data.balance !== undefined) {
        this.log("info", "SMS Pool authentication successful");
        return true;
      }
      return false;
    } catch (error) {
      this.log("error", "SMS Pool authentication failed", error);
      return false;
    }
  }

  async fetchServices(): Promise<ServiceMapping[]> {
    try {
      const response = await this.client.get("/api/v2/number/regions", {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.data.regions || !Array.isArray(response.data.regions)) {
        return [];
      }

      const services: ServiceMapping[] = [];
      for (const country of Object.keys(response.data.regions)) {
        const region = response.data.regions[country];
        services.push({
          externalId: country,
          name: `${country} SMS Verification`,
          price: region.price || 0.5,
          minOrder: 1,
          maxOrder: 100,
          description: `SMS verification numbers for ${country}`
        });
      }
      return services;
    } catch (error) {
      this.log("error", "Failed to fetch SMS Pool services", error);
      return [];
    }
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    try {
      const country = request.serviceId; // Country code
      const additionalInfo = request.additionalInfo && typeof request.additionalInfo === "object" && !Array.isArray(request.additionalInfo)
        ? request.additionalInfo
        : {};
      const serviceId = typeof additionalInfo.serviceId === "string" ? additionalInfo.serviceId : "telegram";

      const response = await this.client.get("/api/v2/purchase/sms", {
        params: {
          country,
          service: serviceId,
          quantity: request.quantity
        },
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        }
      });

      if (response.data.id) {
        return {
          externalOrderId: response.data.id.toString(),
          status: "pending",
          message: `Numbers received: ${response.data.numbers?.length || 0}`
        };
      }

      throw new Error(response.data.error || "Failed to purchase numbers");
    } catch (error) {
      this.log("error", "Failed to place SMS Pool order", error);
      throw error;
    }
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderStatus> {
    try {
      const response = await this.client.get(`/api/v2/sms/${externalOrderId}`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        }
      });

      if (response.data) {
        const data = response.data;
        return {
          externalOrderId,
          status: this.mapStatus(data.status),
          progress: data.received ? 100 : 0,
          message: data.code ? `Code received: ${data.code}` : "Waiting for SMS...",
          lastUpdated: new Date()
        };
      }

      throw new Error("Failed to check SMS status");
    } catch (error) {
      this.log("error", "Failed to check SMS Pool status", error);
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
        message: isHealthy ? "SMS Pool is operational" : "SMS Pool is unreachable"
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
      const response = await this.client.post(
        `/api/v2/number/${externalOrderId}/release`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      this.log("error", "Failed to refund SMS order", error);
      return false;
    }
  }

  async getSupportedPaymentMethods(): Promise<string[]> {
    return ["credit_card", "crypto"];
  }

  private mapStatus(providerStatus: string): string {
    const STATUS_MAP: { [key: string]: string } = {
      "pending": "pending",
      "received": "completed",
      "completed": "completed",
      "expired": "cancelled",
      "released": "refunded"
    };
    return STATUS_MAP[providerStatus?.toLowerCase() || ""] || "unknown";
  }
}


