/**
 * Provider Setup & Initialization
 * Registers all available providers
 */

import pino from "pino";
import { ProviderManager } from "./provider-manager";
import { ResellingSMMAdapter } from "./adapters/smm-adapter";
import { SMSPoolAdapter } from "./adapters/sms-pool-adapter";
import { BulkAccAdapter } from "./adapters/bulkacc-adapter";

let providerManager: ProviderManager | null = null;

export function initializeProviders(logger?: any): ProviderManager {
  if (providerManager) {
    return providerManager;
  }

  const log = logger || pino();
  providerManager = new ProviderManager(log);

  providerManager.registerAdapter("smm", ResellingSMMAdapter);
  providerManager.registerAdapter("virtual-numbers", SMSPoolAdapter);
  providerManager.registerAdapter("logs", BulkAccAdapter);

  log.info("Provider system initialized");
  return providerManager;
}

export function getProviderManager(): ProviderManager {
  if (!providerManager) {
    return initializeProviders();
  }
  return providerManager;
}

export { ProviderManager };
export * from "./base-adapter";
export * from "./provider-manager";
