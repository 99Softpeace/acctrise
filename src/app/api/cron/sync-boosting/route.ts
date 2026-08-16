import { NextRequest, NextResponse } from "next/server";
import { syncJustAnotherPanelServices } from "@/lib/providers/seed-env-providers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncJustAnotherPanelServices();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/sync-boosting]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Boosting service sync failed"
      },
      { status: 500 }
    );
  }
}
