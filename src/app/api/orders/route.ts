/**
 * Create Order API Route
 * POST /api/orders
 */

import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth/request";
import { getServices } from "@/lib/services";
import { z } from "zod";

const createOrderSchema = z.object({
  serviceId: z.string(),
  quantity: z.number().int().positive(),
  targetUrl: z.string().url().optional(),
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

    const body = await request.json();

    // Validate request
    const validatedData = createOrderSchema.parse(body);

    const { order: orderService } = getServices();

    // Create order
    const newOrder = await orderService.createOrder({
      userId,
      ...validatedData
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          status: newOrder.status,
          quantity: newOrder.quantity,
          totalPrice: newOrder.totalPrice.toString(),
          createdAt: newOrder.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
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

    const { order: orderService } = getServices();

    const { orders, total } = await orderService.getUserOrders(userId, limit, offset);

    return NextResponse.json({
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}


