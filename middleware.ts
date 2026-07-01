import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasRole } from "@/lib/auth/roles";

const protectedPrefixes = ["/dashboard", "/api/wallet", "/api/orders", "/api/auth/devices"];
const staffPrefixes = ["/admin", "/api/admin"];

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isStaffPath(pathname: string) {
  return staffPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname) && !isStaffPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isApi = pathname.startsWith("/api/");

  if (!token?.id) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isStaffPath(pathname) && !hasRole((token.role as any) || "CUSTOMER", "ADMIN")) {
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/wallet/:path*", "/api/orders/:path*", "/api/auth/devices"]
};
