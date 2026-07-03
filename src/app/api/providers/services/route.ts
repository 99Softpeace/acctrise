import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request";
import { fetchLiveServices, isLiveServiceKind } from "@/lib/providers/live-services";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kind = request.nextUrl.searchParams.get("kind");
  if (!isLiveServiceKind(kind)) {
    return NextResponse.json(
      { error: "Invalid provider service kind." },
      { status: 400 }
    );
  }

  try {
    const result = await fetchLiveServices(kind);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[providers/services]", { kind, error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Provider service fetch failed." },
      { status: 502 }
    );
  }
}
