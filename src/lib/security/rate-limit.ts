import { createHash } from "crypto";
import { connectMongo } from "@/lib/mongodb";
import { RateLimit } from "@/models/rate-limit";

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super("Too many requests. Please try again later.");
    this.name = "RateLimitError";
  }
}

export function clientIp(headers: Headers | Record<string, string | string[] | undefined>) {
  const read = (name: string) => headers instanceof Headers ? headers.get(name) : headers[name] || headers[name.toLowerCase()];
  const forwarded = read("x-forwarded-for");
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return String(value || read("x-real-ip") || "unknown").split(",")[0].trim();
}

export async function enforceRateLimit(scope: string, identifier: string, limit: number, windowMs: number) {
  await connectMongo();
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const key = createHash("sha256").update(`${scope}:${identifier}:${bucket}`).digest("hex");
  const expiresAt = new Date((bucket + 2) * windowMs);
  const row = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { key, expiresAt } },
    { new: true, upsert: true }
  ).lean();
  if (row && row.count > limit) throw new RateLimitError(Math.ceil(((bucket + 1) * windowMs - now) / 1000));
}
