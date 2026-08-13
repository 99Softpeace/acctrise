export const PROFIT_MARGIN_RATE = 0.3;
export const PROFIT_MARGIN_PERCENT = PROFIT_MARGIN_RATE * 100;
export const NUMBER_PROFIT_MARGIN_RATE = 2;
export const NUMBER_PROFIT_MARGIN_PERCENT = NUMBER_PROFIT_MARGIN_RATE * 100;
export const MAJOR_SOCIAL_NUMBER_PRICE_NGN = 2500;
export const DISCORD_NUMBER_PRICE_NGN = 5000;
export const OTHER_SOCIAL_NUMBER_PROFIT_MARGIN_RATE = 6;
export const OTHER_SOCIAL_NUMBER_PROFIT_MARGIN_PERCENT = OTHER_SOCIAL_NUMBER_PROFIT_MARGIN_RATE * 100;
export const NUMBER_LOW_PRICE_THRESHOLD_NGN = 1000;
export const NUMBER_LOW_PRICE_MINIMUM_NGN = 1200;
export const NUMBER_LOW_PRICE_MAXIMUM_NGN = 1259;
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

export function applyNumberProfitMargin(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  return Number((price * (1 + NUMBER_PROFIT_MARGIN_RATE)).toFixed(6));
}

export function isOtherSocialNumber(serviceText?: string): boolean {
  if (!serviceText || isMajorSocialNumber(serviceText) || isDiscordNumber(serviceText)) return false;
  return /linkedin|youtube|reddit|pinterest|twitch|spotify|tumblr|wechat|line|viber|signal|clubhouse|quora|skype|bigo|imo|kakao|meetme|hinge|tinder|bumble/i.test(serviceText);
}

export function applyNumberServiceProfitMargin(price: number, serviceText?: string): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  const marginRate = isOtherSocialNumber(serviceText) ? OTHER_SOCIAL_NUMBER_PROFIT_MARGIN_RATE : NUMBER_PROFIT_MARGIN_RATE;
  return Number((price * (1 + marginRate)).toFixed(6));
}

export function isMajorSocialNumber(serviceText?: string): boolean {
  if (!serviceText) return false;
  return /whats?app|facebook|instagram|messenger|threads|snapchat|tik\s?tok|telegram|twitter|(?:^|\W)x(?:$|\W)/i.test(serviceText);
}

export function isDiscordNumber(serviceText?: string): boolean {
  return Boolean(serviceText && /discord/i.test(serviceText));
}

export function applyFixedSocialNumberPrice(priceUsd: number, exchangeRate: number, serviceText?: string): number {
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return priceUsd;
  // These advertised prices are floors, not overrides. `priceUsd` already
  // includes the number-service margin, so retaining the larger value keeps
  // expensive countries/provider rates profitable while preserving the
  // familiar minimum price for cheaper numbers.
  if (isDiscordNumber(serviceText)) return Math.max(priceUsd, DISCORD_NUMBER_PRICE_NGN / exchangeRate);
  if (isMajorSocialNumber(serviceText)) return Math.max(priceUsd, MAJOR_SOCIAL_NUMBER_PRICE_NGN / exchangeRate);
  return priceUsd;
}

export function applyNumberMinimumPrice(priceUsd: number, exchangeRate: number, serviceText?: string): number {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0 || !Number.isFinite(exchangeRate) || exchangeRate <= 0) return priceUsd;
  if (priceUsd * exchangeRate >= NUMBER_LOW_PRICE_THRESHOLD_NGN) return priceUsd;
  const text = serviceText || "number service";
  let hash = 0;
  for (const character of text.toLowerCase()) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const range = NUMBER_LOW_PRICE_MAXIMUM_NGN - NUMBER_LOW_PRICE_MINIMUM_NGN + 1;
  return (NUMBER_LOW_PRICE_MINIMUM_NGN + (hash % range)) / exchangeRate;
}

export function applyProfitMarginCents(cents: number): number {
  if (!Number.isFinite(cents) || cents <= 0) return cents;
  return Math.ceil(cents * (1 + PROFIT_MARGIN_RATE));
}
