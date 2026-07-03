/**
 * BulkAcc Logs Provider Adapter
 * Handles account logs and bulk account services
 */

import { BaseProviderAdapter, ProviderConfig, OrderRequest, OrderResponse, OrderStatus, ServiceMapping, ProviderHealth } from "../base-adapter";
import axios, { AxiosInstance } from "axios";

interface BulkAccProductResponse {
  code: string;
  name: string;
  description?: string;
  categoryName?: string;
  groupName?: string;
  inStock?: number;
  min?: number;
  price: number;
}

export class BulkAccAdapter extends BaseProviderAdapter {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    super(providerId, config, logger);

    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl();

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
      const response = await this.client.get("/api/accounts", {
        params: { apiKey: this.config.apiKey }
      });

      if (response.status === 200 && response.data?.statusCode === 200 && response.data.data !== undefined) {
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
      const pageSize = Number(process.env.BULKACC_PAGE_SIZE || 100);
      const response = await this.client.get("/api/products/list", {
        params: {
          apiKey: this.config.apiKey,
          pageIndex: 1,
          pageSize: Math.min(Math.max(pageSize, 10), 200)
        }
      });

      if (response.data?.statusCode !== 200) {
        throw new Error(response.data?.message || "Bulkacc product list request failed.");
      }

      const products = response.data?.data?.items;
      if (!Array.isArray(products)) {
        throw new Error("Bulkacc product list response did not include items.");
      }

      return products.map((product: BulkAccProductResponse) => ({
        externalId: product.code,
        name: product.name,
        price: Number(product.price || 0),
        minOrder: product.min || 1,
        maxOrder: product.inStock,
        description: `${product.groupName || "Bulkacc"} - ${product.categoryName || product.description || product.name}`
      }));
    } catch (error) {
      this.log("error", "Failed to fetch BulkAcc services", error);
      throw error;
    }
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await this.client.post("/api/orders", null, {
        params: {
          apiKey: this.config.apiKey,
          productCode: request.serviceId,
          quantity: request.quantity
        }
      });

      if (response.data?.statusCode === 200 && response.data.data) {
        return {
          externalOrderId: String(response.data.data),
          status: "pending",
          message: response.data.message || "Order placed successfully"
        };
      }

      throw new Error(response.data?.message || "Failed to place Bulkacc order");
    } catch (error) {
      this.log("error", "Failed to place BulkAcc order", error);
      throw error;
    }
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderStatus> {
    try {
      const response = await this.client.get("/api/orders", {
        params: {
          apiKey: this.config.apiKey,
          orderCode: externalOrderId
        }
      });

      if (response.data?.statusCode === 200) {
        const accounts = Array.isArray(response.data.data) ? response.data.data : [];
        return {
          externalOrderId,
          status: accounts.length ? "completed" : "processing",
          progress: accounts.length ? 100 : 50,
          message: accounts.length ? `${accounts.length} accounts delivered` : response.data.message || "Processing...",
          lastUpdated: new Date()
        };
      }

      throw new Error(response.data?.message || "Order not found");
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

  async refundOrder(): Promise<boolean> {
    return false;
  }

  async getSupportedPaymentMethods(): Promise<string[]> {
    return ["wallet"];
  }

  private getDefaultBaseUrl() {
    return "https://bulkacc.com";
  }
}
