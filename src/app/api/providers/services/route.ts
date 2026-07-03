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
      { error: "Invalid service type." },
      { status: 400 }
    );
  }

  try {
    const result = await fetchLiveServices(kind);
    return NextResponse.json({
      success: true,
      kind: result.kind,
      label: "Live services",
      services: result.services.map((service) => ({
        externalId: service.externalId,
        name: service.name,
        description: service.description,
        price: service.price,
        minOrder: service.minOrder,
        maxOrder: service.maxOrder
      }))
    });
  } catch (error) {
    console.error("[providers/services]", { kind, error });
    return NextResponse.json(
      { error: "Service is available, but fulfillment is temporarily unavailable. Please contact support." },
      { status: 502 }
    );
  }
}
