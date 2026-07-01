/**
 * Service Layer Index
 * Exports all services for easy access.
 */

export {
  getOrCreateWallet,
  createFundingTransaction,
  completeTransactionByReference,
  failTransactionByReference,
  getTransactionHistory,
  deductForOrder,
  refundOrder
} from "./mongo-wallet-service";
export type { WalletResponse, TransactionResponse } from "./mongo-wallet-service";

export { OrderService } from "./order-service";
export type { CreateOrderRequest, UpdateOrderStatusRequest, OrderWithDetails } from "./order-service";

import pino from "pino";
import { OrderService } from "./order-service";
import { initializeProviders, ProviderManager } from "../providers";
import * as wallet from "./mongo-wallet-service";

let serviceContainer: {
  wallet: typeof wallet;
  order: OrderService;
  providers: ProviderManager;
} | null = null;

export function initializeServices(logger?: any) {
  if (serviceContainer) return serviceContainer;

  const log = logger || pino({ level: process.env.LOG_LEVEL || "info" });
  const providerManager = initializeProviders(log);
  const orderService = new OrderService(providerManager, log);

  serviceContainer = {
    wallet,
    order: orderService,
    providers: providerManager
  };

  log.info("All services initialized");
  return serviceContainer;
}

export function getServices() {
  return initializeServices();
}
