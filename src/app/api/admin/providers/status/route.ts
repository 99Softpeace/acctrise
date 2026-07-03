import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request";
import { hasRole } from "@/lib/auth/roles";
import { getProviderEnvStatuses } from "@/lib/providers/env-status";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(user.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const liveCheck = request.nextUrl.searchParams.get("live") === "1";

  try {
    const providers = await getProviderEnvStatuses({ liveCheck });
    return NextResponse.json({
      success: true,
      liveCheck,
      providers
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Provider status check failed" },
      { status: 500 }
    );
  }
}
