/**
 * Provider Registry & Manager
 * Handles provider instantiation, failover, and switching
 */

import { connectMongo } from "@/lib/mongodb";
import { Provider } from "@/models/provider";
import { ProviderService } from "@/models/provider-service";
import { BaseProviderAdapter, ProviderConfig } from "./base-adapter";

export interface ProviderRegistry {
  [key: string]: new (id: string, config: ProviderConfig, logger?: any) => BaseProviderAdapter;
}

export class ProviderManager {
  private providers: Map<string, BaseProviderAdapter> = new Map();
  private registry: ProviderRegistry = {};
  private logger: any;

  constructor(logger?: any) {
    this.logger = logger;
  }

  registerAdapter(type: string, AdapterClass: new (id: string, config: ProviderConfig, logger?: any) => BaseProviderAdapter) {
    this.registry[type] = AdapterClass;
    this.log("info", `Adapter registered: ${type}`);
  }

  async initializeProvider(providerId: string): Promise<BaseProviderAdapter | null> {
    if (this.providers.has(providerId)) {
      return this.providers.get(providerId)!;
    }

    try {
      await connectMongo();
      const provider = await Provider.findById(providerId);

      if (!provider) {
        this.log("warn", `Provider not found: ${providerId}`);
        return null;
      }

      const AdapterClass = this.registry[provider.type];
      if (!AdapterClass) {
        this.log("error", `No adapter registered for type: ${provider.type}`);
        return null;
      }

      const config = provider.config as ProviderConfig;
      const adapter = new AdapterClass(provider._id.toString(), config, this.logger);

      const isConnected = await adapter.authenticate();
      if (!isConnected) {
        this.log("warn", `Failed to authenticate provider: ${providerId}`);
        return null;
      }

      this.providers.set(providerId, adapter);
      return adapter;
    } catch (error) {
      this.log("error", `Error initializing provider: ${providerId}`, error);
      return null;
    }
  }

  async getProvider(providerId: string): Promise<BaseProviderAdapter | null> {
    return this.initializeProvider(providerId);
  }

  async getProvidersForService(serviceId: string): Promise<BaseProviderAdapter[]> {
    try {
      await connectMongo();
      const providerServices = await ProviderService.find({ serviceId, isActive: true })
        .sort({ priority: -1 })
        .populate("providerId");

      const adapters: BaseProviderAdapter[] = [];
      for (const providerService of providerServices) {
        const provider = providerService.providerId as any;
        if (!provider || provider.status !== "ACTIVE") continue;

        const adapter = await this.getProvider(provider._id.toString());
        if (adapter) adapters.push(adapter);
      }

      return adapters;
    } catch (error) {
      this.log("error", `Error getting providers for service: ${serviceId}`, error);
      return [];
    }
  }

  async executeWithFailover<T>(
    serviceId: string,
    operation: (adapter: BaseProviderAdapter) => Promise<T>,
    fallbackValue?: T
  ): Promise<T> {
    const providers = await this.getProvidersForService(serviceId);

    if (providers.length === 0) {
      this.log("error", `No providers available for service: ${serviceId}`);
      if (fallbackValue !== undefined) return fallbackValue;
      throw new Error(`No providers available for service: ${serviceId}`);
    }

    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        return await operation(provider);
      } catch (error) {
        lastError = error as Error;
        this.log("warn", "Operation failed with provider, trying next...", { error: lastError.message });
      }
    }

    if (lastError) throw lastError;
    if (fallbackValue !== undefined) return fallbackValue;
    throw new Error(`All providers failed for service: ${serviceId}`);
  }

  clearProviderCache(providerId?: string) {
    if (providerId) {
      this.providers.delete(providerId);
    } else {
      this.providers.clear();
    }
  }

  private log(level: "info" | "warn" | "error", message: string, data?: any) {
    if (this.logger) {
      this.logger[level](message, data);
    } else {
      console.log(`[ProviderManager] ${message}`, data);
    }
  }
}
