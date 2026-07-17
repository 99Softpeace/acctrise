import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request";
import { fetchLiveCountries, fetchLiveServices, isLiveServiceKind } from "@/lib/providers/live-services";
import { getUsdToNgnRate } from "@/lib/pricing/exchange-rate";
import { getCachedLiveValue } from "@/lib/cache/live-service-cache";

const FRIENDLY_PROVIDER_MESSAGE = "This service is available, but fulfillment is temporarily unavailable. Please contact support.";
const SERVICE_CACHE_MS = 30 * 1000;
const COUNTRY_CACHE_MS = 5 * 60 * 1000;

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { ...init?.headers, "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
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
        return json({ countries: [] });
      }

      const countries = await getCachedLiveValue(`countries:${kind}`, COUNTRY_CACHE_MS, () => fetchLiveCountries(kind));
      return json({ success: true, countries });
    }

    const countryId = request.nextUrl.searchParams.get("countryId") || undefined;
    const countryName = request.nextUrl.searchParams.get("countryName") || undefined;
    const query = request.nextUrl.searchParams.get("q") || undefined;
    const limit = Number(request.nextUrl.searchParams.get("limit") || 30);
    const serviceKey = [kind, countryId || "", countryName || "", query || "", limit].join(":");

    const [result, exchangeRate] = await Promise.all([
      getCachedLiveValue(`services:${serviceKey}`, SERVICE_CACHE_MS, () => fetchLiveServices(kind, { countryId, countryName, query, limit })),
      getUsdToNgnRate()
    ]);

    const pricing = {
      sourceCurrency: "USD",
      displayCurrency: "NGN",
      exchangeRate: exchangeRate.rate,
      rateSource: exchangeRate.source,
      rateFetchedAt: exchangeRate.fetchedAt,
      fallback: exchangeRate.fallback,
      profitMarginPercent: result.profitMarginPercent
    };

    return json({
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
        categoryName: service.categoryName,
        groupName: service.groupName,
        stock: service.stock,
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
