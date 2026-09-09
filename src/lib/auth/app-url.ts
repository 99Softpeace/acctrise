export function appUrl(path: string): string {
  return new URL(path, process.env.NEXTAUTH_URL || "http://localhost:3000").toString();
}
