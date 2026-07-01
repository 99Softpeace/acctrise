/**
 * Provider Adapter Pattern
 * Abstract interface for all service providers
 * Supports: SMM, Virtual Numbers, eSIM, etc.
 */

export interface ProviderConfig {
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  rateLimit?: RateLimit;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelayMs: number;
}

export interface RateLimit {
  requestsPerSecond: number;
  burstLimit?: number;
}

export interface OrderRequest {
  serviceId: string;
  quantity: number;
  targetUrl?: string;
  targetUsername?: string;
  targetPhone?: string;
  additionalInfo?: Record<string, unknown>;
}

export interface OrderResponse {
  externalOrderId: string;
  status: string;
  message?: string;
  startDate?: Date;
  estimatedCompletionDate?: Date;
}

export interface OrderStatus {
  externalOrderId: string;
  status: string;
  progress?: number;
  message?: string;
  lastUpdated?: Date;
}

export interface ServiceMapping {
  externalId: string;
  name: string;
  price: number;
  minOrder: number;
  maxOrder?: number;
  description?: string;
}

export interface ProviderHealth {
  isHealthy: boolean;
  status: "active" | "maintenance" | "error";
  lastCheck: Date;
  message?: string;
}

/**
 * Base Provider Adapter
 * All providers must implement these methods
 */
export abstract class BaseProviderAdapter {
  protected config: ProviderConfig;
  protected providerId: string;
  protected logger: any;

  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    this.providerId = providerId;
    this.config = config;
    this.logger = logger;
  }

  abstract authenticate(): Promise<boolean>;
  abstract fetchServices(): Promise<ServiceMapping[]>;
  abstract placeOrder(request: OrderRequest): Promise<OrderResponse>;
  abstract checkOrderStatus(externalOrderId: string): Promise<OrderStatus>;
  abstract checkHealth(): Promise<ProviderHealth>;
  abstract refundOrder(externalOrderId: string): Promise<boolean>;
  abstract getSupportedPaymentMethods(): Promise<string[]>;

  getProviderId(): string {
    return this.providerId;
  }

  protected log(level: "info" | "error" | "warn", message: string, data?: any) {
    if (this.logger) {
      this.logger[level](`[${this.providerId}] ${message}`, data);
    } else {
      console.log(`[${this.providerId}] ${message}`, data);
    }
  }
}
