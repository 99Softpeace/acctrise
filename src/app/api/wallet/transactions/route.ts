/**
 * Wallet Transaction History API Route
 * GET /api/wallet/transactions?status=COMPLETED&type=DEPOSIT&limit=25&offset=0
 */

import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth/request";
import { getTransactionHistory } from "@/lib/services/mongo-wallet-service";
import { transactionStatuses, transactionTypes, type TransactionStatus, type TransactionType } from "@/models/transaction";

function enumValue<T extends readonly string[]>(source: T, value: string | null): T[number] | undefined {
  if (!value) return undefined;
  return source.includes(value) ? value : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const limit = Number(params.get("limit") || 50);
    const offset = Number(params.get("offset") || 0);
    const type = enumValue(transactionTypes, params.get("type")) as TransactionType | undefined;
    const status = enumValue(transactionStatuses, params.get("status")) as TransactionStatus | undefined;

    const result = await getTransactionHistory({ userId, type, status, limit, offset });

    return NextResponse.json({
      success: true,
      total: result.total,
      transactions: result.transactions
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
