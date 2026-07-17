import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { normalizeEmail, verifyPassword } from "@/lib/auth/security";
import { connectMongo } from "@/lib/mongodb";
import { LoginHistory } from "@/models/login-history";
import { User } from "@/models/user";
import { clientIp, enforceRateLimit } from "@/lib/security/rate-limit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login"
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        await connectMongo();
        const email = normalizeEmail(credentials?.email || "");
        const password = credentials?.password || "";
        const ipAddress = clientIp(request?.headers || {});
        await enforceRateLimit("login", ipAddress, 10, 15 * 60 * 1000);
        const userAgent = request?.headers?.["user-agent"]?.toString() || "unknown";

        const user = await User.findOne({ email }).select("_id email username passwordHash role status emailVerified").lean();

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        void LoginHistory.create({
          userId: user._id,
          ipAddress,
          userAgent,
          isSuccessful: isValid,
          failureReason: isValid ? null : "invalid_credentials"
        }).catch((error) => console.error("[auth/login-history]", error));

        if (!isValid || user.status !== "active") {
          return null;
        }

        void User.updateOne(
          { _id: user._id },
          {
            $set: {
              lastLoginAt: new Date(),
              lastLoginIp: ipAddress
            }
          }
        ).catch((error) => console.error("[auth/last-login]", error));

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          role: user.role,
          username: user.username,
          emailVerified: user.emailVerified?.toISOString() || null
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.username = token.username as string;
        session.user.emailVerified = token.emailVerified as string | null;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
