import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request";
import { fetchLiveCountries, fetchLiveServices, isLiveServiceKind } from "@/lib/providers/live-services";
import { getUsdToNgnRate } from "@/lib/pricing/exchange-rate";

const FRIENDLY_PROVIDER_MESSAGE = "This service is available, but fulfillment is temporarily unavailable. Please contact support.";

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
    const scope = request.nextUrl.searchParams.get("scope");

    if (scope === "countries") {
      if (kind !== "foreign-numbers" && kind !== "uk-premium") {
        return NextResponse.json({ countries: [] });
      }

      const countries = await fetchLiveCountries(kind);
      return NextResponse.json({ success: true, countries });
    }

    const [result, exchangeRate] = await Promise.all([
      fetchLiveServices(kind, {
        countryId: request.nextUrl.searchParams.get("countryId") || undefined,
        countryName: request.nextUrl.searchParams.get("countryName") || undefined,
        query: request.nextUrl.searchParams.get("q") || undefined,
        limit: Number(request.nextUrl.searchParams.get("limit") || 30)
      }),
      getUsdToNgnRate()
    ]);

    const pricing = {
      sourceCurrency: "USD",
      displayCurrency: "NGN",
      exchangeRate: exchangeRate.rate,
      rateSource: exchangeRate.source,
      rateFetchedAt: exchangeRate.fetchedAt,
      fallback: exchangeRate.fallback
    };

    return NextResponse.json({
      success: true,
      kind: result.kind,
      label: "Live services",
      pricing,
      services: result.services.map((service) => ({
        externalId: service.externalId,
        serviceId: service.serviceId,
        name: service.name,
        description: service.description,
        price: service.price,
        minOrder: service.minOrder,
        maxOrder: service.maxOrder,
        countryId: service.countryId,
        countryName: service.countryName,
        availability: service.availability,
        friendlyLabel: service.friendlyLabel,
        exchangeRate: exchangeRate.rate,
        rateSource: exchangeRate.source,
        rateFetchedAt: exchangeRate.fetchedAt,
        rateFallback: exchangeRate.fallback
      }))
    });
  } catch (error) {
    console.error("[providers/services]", { kind, error });
    return NextResponse.json(
      { error: FRIENDLY_PROVIDER_MESSAGE },
      { status: 502 }
    );
  }
}
