import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/types/auth";

export interface RequestUser {
  id: string;
  role: UserRole;
  email?: string | null;
}

export async function getRequestUser(request: NextRequest): Promise<RequestUser | null> {
  const headerUserId = request.headers.get("x-user-id");
  const headerRole = request.headers.get("x-user-role") as UserRole | null;

  if (headerUserId && process.env.NODE_ENV === "development") {
    return { id: headerUserId, role: headerRole || "CUSTOMER" };
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token?.id) {
    return {
      id: token.id as string,
      role: (token.role as UserRole) || "CUSTOMER",
      email: token.email
    };
  }

  if (process.env.NODE_ENV === "development" && process.env.DEVELOPMENT_USER_ID) {
    return { id: process.env.DEVELOPMENT_USER_ID, role: "CUSTOMER" };
  }

  return null;
}

export async function getRequestUserId(request: NextRequest): Promise<string | null> {
  return (await getRequestUser(request))?.id || null;
}
