/**
 * Compatibility exports for wallet operations.
 * The active wallet implementation is MongoDB-backed.
 */

export {
  getWallet,
  getOrCreateWallet,
  createFundingTransaction as fundWallet,
  completeTransactionByReference,
  failTransactionByReference,
  deductForOrder,
  refundOrder,
  getTransactionHistory
} from "./mongo-wallet-service";

export type { WalletResponse, TransactionResponse } from "./mongo-wallet-service";
