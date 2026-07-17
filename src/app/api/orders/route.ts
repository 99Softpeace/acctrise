/**
 * Create Order API Route
 * POST /api/orders
 */

import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth/request";
import { getServices } from "@/lib/services";
import { isLiveServiceKind } from "@/lib/providers/live-services";
import { resolveLiveService } from "@/lib/providers/resolve-live-service";
import { ProviderOrder } from "@/models/provider-order";
import { z } from "zod";
import { clientIp, enforceRateLimit, RateLimitError } from "@/lib/security/rate-limit";

const FRIENDLY_PROVIDER_MESSAGE = "This service is available, but fulfillment is temporarily unavailable. Please contact support.";
const USER_SAFE_ERRORS = [/insufficient wallet balance/i, /minimum order quantity/i, /maximum order quantity/i, /service is currently unavailable/i, /unauthorized/i];

const createOrderSchema = z.object({
  serviceId: z.string().optional(),
  kind: z.string().optional(),
  externalServiceId: z.string().optional(),
  countryId: z.string().optional(),
  countryName: z.string().optional(),
  serviceName: z.string().optional(),
  quantity: z.number().int("Quantity must be a whole number.").positive("Quantity must be greater than zero."),
  targetUrl: z.string().url("Enter a complete profile or post link.").optional(),
  targetUsername: z.string().optional(),
  targetPhone: z.string().optional(),
  additionalInfo: z.record(z.string(), z.unknown()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await enforceRateLimit("create-order", `${userId}:${clientIp(request.headers)}`, 30, 60 * 1000);
    const body = await request.json();

    // Validate request
    const validatedData = createOrderSchema.parse(body);

    let serviceId = validatedData.serviceId;
    let providerInfo: Record<string, unknown> = {};
    const kind = validatedData.kind || null;
    if (validatedData.externalServiceId && isLiveServiceKind(kind)) {
      const resolved = await resolveLiveService(kind, validatedData.externalServiceId, validatedData.countryId, validatedData.countryName, validatedData.serviceName);
      serviceId = resolved.serviceId;
      providerInfo = resolved.additionalInfo;
    }
    if (!serviceId) return NextResponse.json({ error: "A valid service is required." }, { status: 400 });

    const { order: orderService } = getServices();

    // Create order
    const newOrder = await orderService.createOrder({
      userId,
      serviceId,
      quantity: validatedData.quantity,
      targetUrl: validatedData.targetUrl,
      targetUsername: validatedData.targetUsername,
      targetPhone: validatedData.targetPhone,
      additionalInfo: { ...providerInfo, ...(validatedData.additionalInfo || {}) }
    });

    const providerOrder = await ProviderOrder.findOne({ orderId: newOrder.id }).lean();

    return NextResponse.json(
      {
        success: true,
        order: {
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          status: newOrder.status,
          quantity: newOrder.quantity,
          totalPrice: newOrder.totalPrice.toString(),
          statusMessage: newOrder.statusMessage,
          fulfillment: providerOrder?.logs || null,
          createdAt: newOrder.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[orders/create]", error);
    const message = error instanceof Error && USER_SAFE_ERRORS.some((pattern) => pattern.test(error.message))
      ? error.message
      : FRIENDLY_PROVIDER_MESSAGE;

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * Get User Orders
 * GET /api/orders?limit=50&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const services = getServices();
    const orderService = services.order;
    let result = await orderService.getUserOrders(userId, limit, offset);
    let orders = result.orders;
    const total = result.total;
    let providerOrders = await ProviderOrder.find({ orderId: { $in: orders.map((order) => order.id) } }).lean();
    let refreshed = false;
    for (const providerOrder of providerOrders) {
      const order = orders.find((item) => item.id === providerOrder.orderId.toString());
      if (!order || !["PENDING", "PROCESSING"].includes(order.status)) continue;
      if (providerOrder.lastCheckedAt && Date.now() - new Date(providerOrder.lastCheckedAt).getTime() < 8000) continue;
      try {
        const adapter = await services.providers.getProvider(providerOrder.providerId.toString());
        if (!adapter) continue;
        const status = await adapter.checkOrderStatus(providerOrder.externalOrderId);
        await orderService.updateOrderStatus({ orderId: order.id, externalOrderId: providerOrder.externalOrderId, status: status.status, progress: status.progress, message: status.message });
        await ProviderOrder.updateOne({ _id: providerOrder._id }, { $set: { status: status.status, statusMessage: status.message || null, lastCheckedAt: new Date() } });
        refreshed = true;
      } catch (error) {
        console.error("[orders/status]", { providerOrderId: providerOrder._id.toString(), error });
      }
    }
    if (refreshed) {
      result = await orderService.getUserOrders(userId, limit, offset);
      orders = result.orders;
      providerOrders = await ProviderOrder.find({ orderId: { $in: orders.map((order) => order.id) } }).lean();
    }
    const fulfillmentByOrder = new Map(providerOrders.map((item) => [item.orderId.toString(), item.logs]));

    return NextResponse.json({
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        serviceName: order.service?.name || "Service order",
        kind: order.additionalInfo?.kind || null,
        targetUrl: order.targetUrl || null,
        statusMessage: order.statusMessage || null,
        fulfillment: fulfillmentByOrder.get(order.id) || null,
        quantity: order.quantity,
        totalPrice: order.totalPrice.toString(),
        progress: order.delivered,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      })),
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[orders/list]", error);
    const message = error instanceof Error && USER_SAFE_ERRORS.some((pattern) => pattern.test(error.message))
      ? error.message
      : FRIENDLY_PROVIDER_MESSAGE;

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}


