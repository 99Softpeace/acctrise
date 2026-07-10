export const PROFIT_MARGIN_RATE = 0.3;
export const PROFIT_MARGIN_PERCENT = PROFIT_MARGIN_RATE * 100;

export function applyProfitMargin(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  return Number((price * (1 + PROFIT_MARGIN_RATE)).toFixed(6));
}

export function applyProfitMarginCents(cents: number): number {
  if (!Number.isFinite(cents) || cents <= 0) return cents;
  return Math.ceil(cents * (1 + PROFIT_MARGIN_RATE));
}