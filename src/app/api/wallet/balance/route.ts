/**
 * Wallet Balance API Route
 * GET /api/wallet/balance
 */

import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth/request";
import { reconcilePocketFiVirtualAccounts } from "@/lib/payments/virtual-account-reconciliation";
import { getOrCreateWallet } from "@/lib/services/mongo-wallet-service";

export async function GET(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await reconcilePocketFiVirtualAccounts(userId);
    const wallet = await getOrCreateWallet(userId);

    return NextResponse.json({
      success: true,
      wallet
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
