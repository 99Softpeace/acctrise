export const PROFIT_MARGIN_RATE = 0.3;
export const PROFIT_MARGIN_PERCENT = PROFIT_MARGIN_RATE * 100;
export const TIKTOK_LIKES_REACTIONS_MINIMUM_NGN_PER_1000 = 1000;
export const TIKTOK_LIKES_REACTIONS_MAXIMUM_NGN_PER_1000 = 1500;

export function isTikTokLikesOrReactions(serviceText?: string): boolean {
  if (!serviceText) return false;
  return /tiktok/i.test(serviceText) && /likes?|reactions?/i.test(serviceText);
}

function stableRangePrice(serviceText: string): number {
  let hash = 0;
  for (const character of serviceText.toLowerCase()) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  const range = TIKTOK_LIKES_REACTIONS_MAXIMUM_NGN_PER_1000 - TIKTOK_LIKES_REACTIONS_MINIMUM_NGN_PER_1000 + 1;
  return TIKTOK_LIKES_REACTIONS_MINIMUM_NGN_PER_1000 + (hash % range);
}

export function applyTikTokLikesNgnPriceRange(priceUsd: number, exchangeRate: number, serviceText?: string): number {
  if (!isTikTokLikesOrReactions(serviceText) || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return priceUsd;
  }

  const currentNgnPrice = priceUsd * exchangeRate;
  if (currentNgnPrice >= TIKTOK_LIKES_REACTIONS_MINIMUM_NGN_PER_1000) return priceUsd;

  return stableRangePrice(serviceText!) / exchangeRate;
}

export function applyProfitMargin(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  return Number((price * (1 + PROFIT_MARGIN_RATE)).toFixed(6));
}

export function applyProfitMarginCents(cents: number): number {
  if (!Number.isFinite(cents) || cents <= 0) return cents;
  return Math.ceil(cents * (1 + PROFIT_MARGIN_RATE));
}
