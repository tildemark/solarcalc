import NextAuth from "next-auth";
import type { Session } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "";
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
  trustHost: true,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
});

export async function safeAuth(): Promise<Session | null> {
  try {
    return await auth();
  } catch (error) {
    console.error("[auth] Session lookup failed. Falling back to guest mode.", error);
    return null;
  }
}