/**
 * SMS Pool Provider Adapter
 * Handles virtual numbers for SMS verification
 */

import { BaseProviderAdapter, ProviderConfig, OrderRequest, OrderResponse, OrderStatus, ServiceMapping, ProviderHealth } from "../base-adapter";
import axios, { AxiosInstance } from "axios";

export type SMSPoolCountry = {
  id: string;
  name: string;
  shortName?: string;
  dialCode?: string;
  region?: string;
};

type CountryServiceOptions = {
  query?: string;
  limit?: number;
  includePricing?: boolean;
};

export class SMSPoolAdapter extends BaseProviderAdapter {
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
      const response = await this.client.post("/request/balance", this.form({ key: this.config.apiKey }));

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

  async fetchCountries(): Promise<SMSPoolCountry[]> {
    try {
      const response = await this.client.get("/country/retrieve_all");
      const countries = Array.isArray(response.data) ? response.data : response.data?.data;

      if (!Array.isArray(countries)) {
        throw new Error("SMSPool country response did not include a country array.");
      }

      return countries
        .map((country: any) => ({
          id: String(country.ID ?? country.id),
          name: String(country.name || "Unknown country"),
          shortName: country.short_name ? String(country.short_name) : undefined,
          dialCode: country.cc ? String(country.cc) : undefined,
          region: country.region ? String(country.region) : undefined
        }))
        .filter((country) => country.id && country.name !== "Unknown country");
    } catch (error) {
      this.log("error", "Failed to fetch SMS Pool countries", error);
      throw error;
    }
  }

  async fetchServices(): Promise<ServiceMapping[]> {
    try {
      const response = await this.client.get("/service/retrieve_all");
      const services = Array.isArray(response.data) ? response.data : response.data?.data;

      if (!Array.isArray(services)) {
        throw new Error("SMSPool service response did not include a service array.");
      }

      return services.map((service: any) => ({
        externalId: String(service.ID ?? service.id),
        serviceId: String(service.ID ?? service.id),
        name: service.name || `Verification service ${service.ID ?? service.id}`,
        price: Number(service.price || 0),
        minOrder: 1,
        maxOrder: Number(service.stock || service.quantity || 1),
        availability: service.stock || service.quantity ? `${service.stock || service.quantity} available` : "Availability checked at purchase",
        friendlyLabel: service.favourite ? "Popular service" : "Verification service",
        description: "SMS verification service"
      }));
    } catch (error) {
      this.log("error", "Failed to fetch SMS Pool services", error);
      throw error;
    }
  }

  async fetchServicesForCountry(countryId: string, countryName: string, options: CountryServiceOptions = {}): Promise<ServiceMapping[]> {
    try {
      const response = await this.client.get("/service/retrieve_all", { params: { country: countryId } });
      const services = Array.isArray(response.data) ? response.data : response.data?.data;

      if (!Array.isArray(services)) {
        throw new Error(`SMSPool ${countryName} service response did not include a service array.`);
      }

      const search = options.query?.trim().toLowerCase() || "";
      const limit = Math.min(Math.max(options.limit || 30, 1), 60);
      const mapped = services
        .map((service: any) => {
          const serviceId = String(service.ID ?? service.id);
          const name = String(service.name || `Verification service ${serviceId}`);
          return {
            externalId: `${countryId}:${serviceId}`,
            serviceId,
            name,
            price: Number(service.price || 0),
            minOrder: 1,
            maxOrder: Number(service.stock || service.quantity || 1),
            countryId,
            countryName,
            availability: service.stock || service.quantity ? `${service.stock || service.quantity} available` : "Live availability",
            friendlyLabel: service.favourite ? "Popular verification" : `${countryName} verification`,
            description: `${countryName} SMS verification service`
          } satisfies ServiceMapping;
        })
        .filter((service: ServiceMapping) => !search || service.name.toLowerCase().includes(search))
        .slice(0, limit);

      if (options.includePricing === false) return mapped;

      return Promise.all(mapped.map((service) => this.enrichCountryService(service, countryId, service.serviceId || service.externalId)));
    } catch (error) {
      this.log("error", `Failed to fetch SMS Pool ${countryName} services`, error);
      throw error;
    }
  }

  async fetchEsimServices(): Promise<ServiceMapping[]> {
    try {
      const response = await this.client.post("/esim/pricing", this.form({ key: this.config.apiKey, start: "0", length: "100", Search: "" }));
      const services = Array.isArray(response.data?.data) ? response.data.data : response.data;

      if (!Array.isArray(services)) {
        throw new Error("SMSPool eSIM pricing response did not include a data array.");
      }

      return services.map((plan: any) => ({
        externalId: String(plan.ID ?? plan.id),
        name: `${plan.name || plan.countryCode || "eSIM"} eSIM ${plan.dataInGb ?? ""}GB`.trim(),
        price: Number(plan.price || 0),
        minOrder: 1,
        maxOrder: 1,
        availability: "Activation details after purchase",
        friendlyLabel: "Travel data",
        description: `${plan.speed || "Data"} eSIM plan${plan.countryCode ? ` - ${plan.countryCode}` : ""}`
      }));
    } catch (error) {
      this.log("error", "Failed to fetch SMS Pool eSIM services", error);
      throw error;
    }
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    try {
      const country = request.serviceId;
      const additionalInfo = request.additionalInfo && typeof request.additionalInfo === "object" && !Array.isArray(request.additionalInfo)
        ? request.additionalInfo
        : {};
      const serviceId = typeof additionalInfo.serviceId === "string" ? additionalInfo.serviceId : "telegram";

      const response = await this.client.post("/purchase/sms", this.form({
        key: this.config.apiKey,
        country,
        service: serviceId,
        quantity: request.quantity.toString()
      }));

      if (response.data.order_id || response.data.id) {
        return {
          externalOrderId: String(response.data.order_id || response.data.id),
          status: "pending",
          message: `Numbers received: ${response.data.numbers?.length || 0}`
        };
      }

      throw new Error(response.data.error || response.data.message || "Failed to purchase numbers");
    } catch (error) {
      this.log("error", "Failed to place SMS Pool order", error);
      throw error;
    }
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderStatus> {
    try {
      const response = await this.client.post("/sms/check", this.form({ key: this.config.apiKey, orderid: externalOrderId }));

      if (response.data) {
        const data = response.data;
        return {
          externalOrderId,
          status: this.mapStatus(String(data.status ?? data.status_code ?? "")),
          progress: data.sms || data.code ? 100 : 0,
          message: data.sms || data.code ? `Code received: ${data.sms || data.code}` : "Waiting for SMS...",
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

  async refundOrder(): Promise<boolean> {
    return false;
  }

  async getSupportedPaymentMethods(): Promise<string[]> {
    return ["wallet"];
  }

  private async enrichCountryService(service: ServiceMapping, countryId: string, serviceId: string): Promise<ServiceMapping> {
    const [price, stock] = await Promise.all([
      this.lookupPrice(countryId, serviceId),
      this.lookupStock(countryId, serviceId)
    ]);

    return {
      ...service,
      price: price.price || service.price,
      availability: stock ? `${stock} available` : price.successRate ? `${price.successRate}% recent success` : service.availability
    };
  }

  private async lookupPrice(countryId: string, serviceId: string): Promise<{ price: number; successRate?: number }> {
    try {
      const response = await this.client.post("/request/price", this.form({ key: this.config.apiKey, country: countryId, service: serviceId }));
      return {
        price: Number(response.data?.price || response.data?.high_price || 0),
        successRate: response.data?.success_rate !== undefined ? Number(response.data.success_rate) : undefined
      };
    } catch (error) {
      this.log("warn", "Failed to fetch SMS Pool service price", { countryId, serviceId, error });
      return { price: 0 };
    }
  }

  private async lookupStock(countryId: string, serviceId: string): Promise<number | null> {
    try {
      const response = await this.client.post("/sms/stock", this.form({ key: this.config.apiKey, country: countryId, service: serviceId }));
      const amount = Number(response.data?.amount || 0);
      return Number.isFinite(amount) && amount > 0 ? amount : null;
    } catch (error) {
      this.log("warn", "Failed to fetch SMS Pool service stock", { countryId, serviceId, error });
      return null;
    }
  }

  private form(values: Record<string, string>) {
    const form = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => form.append(key, value));
    return form;
  }

  private getDefaultBaseUrl() {
    return "https://api.smspool.net";
  }

  private mapStatus(providerStatus: string): string {
    const STATUS_MAP: { [key: string]: string } = {
      "1": "pending",
      "2": "cancelled",
      "3": "completed",
      "4": "processing",
      "5": "cancelled",
      "6": "refunded",
      "7": "processing",
      "8": "processing",
      "pending": "pending",
      "received": "completed",
      "completed": "completed",
      "expired": "cancelled",
      "released": "refunded"
    };
    return STATUS_MAP[providerStatus?.toLowerCase() || ""] || "unknown";
  }
}
