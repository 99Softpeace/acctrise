import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types/auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      username: string;
      emailVerified: string | null;
    };
  }

  interface User {
    role?: UserRole;
    username?: string;
    emailVerified?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    username?: string;
    emailVerified?: string | null;
  }
}
