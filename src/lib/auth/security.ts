import crypto from "crypto";
import bcrypt from "bcryptjs";

export function hashSecureToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function usernameFromEmail(email: string): string {
  return email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]+/g, "").slice(0, 24) || "user";
}
