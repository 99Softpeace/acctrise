/**
 * Order Service
 * Handles order creation, tracking, and provider integration
 */

import { connectMongo } from "@/lib/mongodb";
import { Order, type OrderStatus } from "@/models/order";
import { OrderLog } from "@/models/order-log";
import { ProviderOrder } from "@/models/provider-order";
import { Category } from "@/models/category";
import { Service } from "@/models/service";
import { SupportTicket } from "@/models/support-ticket";
import { Transaction } from "@/models/transaction";
import { User } from "@/models/user";
import { amountFromCents, deductForOrder, getWallet, mongoId, refundOrder } from "./mongo-wallet-service";
import { ProviderManager } from "../providers/provider-manager";
import { ProviderService } from "@/models/provider-service";

export interface CreateOrderRequest {
  userId: string;
  serviceId: string;
  quantity: number;
  targetUrl?: string;
  targetUsername?: string;
  targetPhone?: string;
  additionalInfo?: Record<string, any>;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  externalOrderId: string;
  status: string;
  progress?: number;
  message?: string;
}

export type OrderWithDetails = {
  id: string;
  orderNumber: string;
  userId: string;
  serviceId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: OrderStatus;
  targetUrl?: string | null;
  targetUsername?: string | null;
  targetPhone?: string | null;
  additionalInfo?: Record<string, any>;
  delivered: number;
  startDate?: Date | null;
  completedAt?: Date | null;
  statusMessage?: string | null;
  retryCount: number;
  lastRetryAt?: Date | null;
  transactionId?: string | null;
  service?: any;
  transaction?: any;
  providerOrder?: any;
  orderLogs?: any[];
  createdAt: Date;
  updatedAt: Date;
};

function orderNumber(): string {
  return `AC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function serializeOrder(order: any, extras: Partial<OrderWithDetails> = {}): OrderWithDetails {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    userId: order.userId.toString(),
    serviceId: order.serviceId.toString(),
    quantity: order.quantity,
    unitPrice: amountFromCents(order.unitPriceCents),
    totalPrice: amountFromCents(order.totalPriceCents),
    status: order.status,
    targetUrl: order.targetUrl,
    targetUsername: order.targetUsername,
    targetPhone: order.targetPhone,
    additionalInfo: order.additionalInfo || {},
    delivered: order.delivered,
    startDate: order.startDate,
    completedAt: order.completedAt,
    statusMessage: order.statusMessage,
    retryCount: order.retryCount,
    lastRetryAt: order.lastRetryAt,
    transactionId: order.transactionId?.toString() || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    ...extras
  };
}

export class OrderService {
  constructor(private providerManager: ProviderManager, private logger?: any) {}

  async createOrder(request: CreateOrderRequest): Promise<OrderWithDetails> {
    await connectMongo();
    const userId = mongoId(request.userId, "user id");
    const serviceId = mongoId(request.serviceId, "service id");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found");
    const category = await Category.findById(service.categoryId);
    const isBoostingService = Boolean(category && /^smm-|social|boost/i.test(`${category.slug || ""} ${category.name || ""}`));
    if (!service.isActive) throw new Error("Service is currently unavailable");

    if (request.quantity < service.minOrder) {
      throw new Error(`Minimum order quantity is ${service.minOrder}`);
    }

    if (service.maxOrder && request.quantity > service.maxOrder) {
      throw new Error(`Maximum order quantity is ${service.maxOrder}`);
    }

    const totalPriceCents = isBoostingService
      ? Math.ceil((service.priceCents * request.quantity) / 1000)
      : service.priceCents * request.quantity;
    const wallet = await getWallet(request.userId);
    if (!wallet || wallet.balanceCents < totalPriceCents) {
      throw new Error("Insufficient wallet balance");
    }

    const order = await Order.create({
      orderNumber: orderNumber(),
      userId,
      serviceId,
      quantity: request.quantity,
      unitPriceCents: service.priceCents,
      totalPriceCents,
      status: "PENDING",
      targetUrl: request.targetUrl,
      targetUsername: request.targetUsername,
      targetPhone: request.targetPhone,
      additionalInfo: request.additionalInfo || {}
    });

    const transaction = await deductForOrder(request.userId, order._id.toString(), Number(amountFromCents(totalPriceCents)));
    order.transactionId = mongoId(transaction.id, "transaction id");
    await order.save();

    this.log("info", `Order created: ${order.orderNumber}`, {
      userId: request.userId,
      serviceId: request.serviceId,
      quantity: request.quantity,
      totalPrice: amountFromCents(totalPriceCents)
    });

    try {
      const providers = await this.providerManager.getProvidersForService(request.serviceId);
      if (providers.length === 0) throw new Error("No providers available for this service");

      let orderPlaced = false;
      let lastError: Error | null = null;

      for (const provider of providers) {
        try {
          const mapping = await ProviderService.findOne({ providerId: mongoId(provider.getProviderId(), "provider id"), serviceId });
          if (!mapping) throw new Error("Provider service mapping is missing");
          const response = await provider.placeOrder({
            serviceId: mapping.externalId,
            quantity: request.quantity,
            targetUrl: request.targetUrl,
            targetUsername: request.targetUsername,
            targetPhone: request.targetPhone,
            additionalInfo: request.additionalInfo
          });

          await ProviderOrder.create({
            orderId: order._id,
            providerId: mongoId(provider.getProviderId(), "provider id"),
            externalOrderId: response.externalOrderId,
            status: response.status || "pending",
            statusMessage: response.message || null,
            logs: response.data || null
          });

          order.status = response.status === "completed" ? "COMPLETED" : "PROCESSING";
          order.startDate = new Date();
          order.statusMessage = response.message || "Order is being processed";
          if (order.status === "COMPLETED") order.completedAt = new Date();
          await order.save();

          orderPlaced = true;
          this.log("info", `Order sent to provider: ${order.orderNumber}`);
          break;
        } catch (error) {
          lastError = error as Error;
          this.log("warn", "Failed with provider, trying next...", { error: lastError.message });
        }
      }

      if (!orderPlaced && lastError) {
        order.status = "FAILED";
        order.statusMessage = lastError.message;
        await order.save();
        throw lastError;
      }
    } catch (error) {
      this.log("error", "Failed to place order with provider: " + order.orderNumber, error);
      try {
        await refundOrder(order._id.toString());
        order.status = "REFUNDED";
        order.statusMessage = "Provider purchase failed; wallet payment was returned.";
        await order.save();
      } catch (refundError) {
        this.log("error", "Automatic wallet refund failed: " + order.orderNumber, refundError);
      }
      throw error;
    }

    return serializeOrder(order);
  }

  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<OrderWithDetails> {
    await connectMongo();
    const order = await Order.findById(request.orderId);
    if (!order) throw new Error("Order not found");

    const statusMap: Record<string, OrderStatus> = {
      pending: "PENDING",
      processing: "PROCESSING",
      active: "PROCESSING",
      completed: "COMPLETED",
      delivered: "COMPLETED",
      failed: "FAILED",
      cancelled: "CANCELLED",
      refunded: "REFUNDED"
    };

    const newStatus = statusMap[request.status?.toLowerCase()] || "PROCESSING";
    const previousStatus = order.status;

    order.status = newStatus;
    order.delivered = request.progress || order.delivered;
    order.statusMessage = request.message || order.statusMessage;
    if (newStatus === "COMPLETED" && !order.completedAt) {
      order.completedAt = new Date();
    }
    await order.save();

    await OrderLog.create({
      orderId: order._id,
      action: "STATUS_UPDATE",
      details: {
        from: previousStatus,
        to: newStatus,
        externalOrderId: request.externalOrderId,
        progress: request.progress,
        message: request.message
      }
    });

    this.log("info", `Order status updated: ${order.orderNumber}`, { newStatus, progress: request.progress });
    return serializeOrder(order);
  }

  async retryOrder(orderId: string): Promise<OrderWithDetails> {
    await connectMongo();
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status === "COMPLETED" || order.status === "REFUNDED") {
      throw new Error("Cannot retry a completed or refunded order");
    }

    if (order.retryCount >= 3) {
      throw new Error("Maximum retry attempts reached");
    }

    order.retryCount += 1;
    order.lastRetryAt = new Date();
    order.status = "PENDING";
    order.statusMessage = "Retry attempt";
    await order.save();

    this.log("info", `Order retry: ${order.orderNumber} (attempt ${order.retryCount})`);

    try {
      const providers = await this.providerManager.getProvidersForService(order.serviceId.toString());

      for (const provider of providers) {
        try {
          const mapping = await ProviderService.findOne({ providerId: mongoId(provider.getProviderId(), "provider id"), serviceId: order.serviceId });
          if (!mapping) continue;
          const response = await provider.placeOrder({
            serviceId: mapping.externalId,
            quantity: order.quantity,
            targetUrl: order.targetUrl || undefined,
            targetUsername: order.targetUsername || undefined,
            targetPhone: order.targetPhone || undefined,
            additionalInfo: order.additionalInfo || {}
          });

          order.status = response.status === "completed" ? "COMPLETED" : "PROCESSING";
          order.statusMessage = "Retry successful";
          await order.save();
          return serializeOrder(order);
        } catch {
          continue;
        }
      }
    } catch (error) {
      this.log("error", `Retry failed for order: ${order.orderNumber}`, error);
    }

    return serializeOrder(order);
  }

  async getOrder(orderId: string): Promise<OrderWithDetails | null> {
    await connectMongo();
    const order = await Order.findById(orderId).populate("serviceId");
    if (!order) return null;

    const [transaction, providerOrder, orderLogs] = await Promise.all([
      Transaction.findOne({ orderId: order._id }),
      ProviderOrder.findOne({ orderId: order._id }),
      OrderLog.find({ orderId: order._id }).sort({ createdAt: -1 })
    ]);

    return serializeOrder(order, {
      service: (order.serviceId as any)?.name ? order.serviceId : undefined,
      transaction,
      providerOrder,
      orderLogs
    });
  }

  async getUserOrders(userId: string, limit = 50, offset = 0): Promise<{ orders: OrderWithDetails[]; total: number }> {
    await connectMongo();
    const query = { userId: mongoId(userId, "user id") };
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);

    const [orders, total] = await Promise.all([
      Order.find(query).populate("serviceId").sort({ createdAt: -1 }).skip(safeOffset).limit(safeLimit),
      Order.countDocuments(query)
    ]);

    return {
      orders: orders.map((order) =>
        serializeOrder(order, { service: (order.serviceId as any)?.name ? order.serviceId : undefined })
      ),
      total
    };
  }

  async requestRefund(orderId: string, reason: string): Promise<OrderWithDetails> {
    await connectMongo();
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (!["COMPLETED", "FAILED", "PENDING"].includes(order.status)) {
      throw new Error("Order cannot be refunded");
    }

    await SupportTicket.create({
      ticketNumber: `REFUND-${Date.now()}`,
      userId: order.userId,
      subject: `Refund Request for Order ${order.orderNumber}`,
      description: reason,
      category: "refund",
      priority: "MEDIUM"
    });

    order.status = "CANCELLED";
    order.statusMessage = "Refund requested";
    await order.save();

    this.log("info", `Refund requested for order: ${order.orderNumber}`, { reason });

    try {
      await refundOrder(orderId);
    } catch (error) {
      this.log("warn", "Automatic refund failed, manual review needed", error);
    }

    return serializeOrder(order);
  }

  private log(level: "info" | "warn" | "error", message: string, data?: any) {
    if (this.logger) {
      this.logger[level](`[OrderService] ${message}`, data);
    }
  }
}
