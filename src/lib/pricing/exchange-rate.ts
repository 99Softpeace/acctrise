const DEFAULT_USD_TO_NGN_RATE = 1600;
const RATE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_RATE_URL = "https://open.er-api.com/v6/latest/USD";

type CachedRate = {
  rate: number;
  source: string;
  fetchedAt: string;
  fallback: boolean;
  expiresAt: number;
};

let cachedRate: CachedRate | null = null;

function sourceName(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "configured exchange rate provider";
  }
}

function fallbackRate(source = "fallback") {
  return {
    rate: DEFAULT_USD_TO_NGN_RATE,
    source,
    fetchedAt: new Date().toISOString(),
    fallback: true
  };
}

function publicRate(rate: CachedRate) {
  return {
    rate: rate.rate,
    source: rate.source,
    fetchedAt: rate.fetchedAt,
    fallback: rate.fallback
  };
}

function readRate(payload: any) {
  return Number(
    payload?.rates?.NGN ??
    payload?.conversion_rates?.NGN ??
    payload?.data?.NGN?.value ??
    payload?.NGN
  );
}

export async function getUsdToNgnRate() {
  const now = Date.now();
  if (cachedRate && cachedRate.expiresAt > now) {
    return publicRate(cachedRate);
  }

  const url = process.env.EXCHANGE_RATE_API_URL || DEFAULT_RATE_URL;
  const source = sourceName(url);

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Exchange rate request failed with ${response.status}`);

    const payload = await response.json();
    const rate = readRate(payload);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Exchange rate response did not include NGN.");

    cachedRate = {
      rate,
      source,
      fetchedAt: new Date().toISOString(),
      fallback: false,
      expiresAt: now + RATE_TTL_MS
    };

    return publicRate(cachedRate);
  } catch (error) {
    console.warn("[exchange-rate] Falling back to default USD/NGN rate", error);
    cachedRate = {
      ...fallbackRate(source),
      expiresAt: now + RATE_TTL_MS
    };

    return publicRate(cachedRate);
  }
}

export { DEFAULT_USD_TO_NGN_RATE };
