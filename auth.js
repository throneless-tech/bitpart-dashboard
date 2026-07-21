import NextAuth from "next-auth";
import authConfig from "@/auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const paths = [
  "/create",
  "/edit",
  "/my-bots",
  "/view"
]

export const { handlers, signIn, signOut, newUser, auth } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    maxAge: 60 * 60,
    strategy: "jwt",
  },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (paths.find((p) => p == pathname)) return !!auth
      return true
    },
    jwt({ token, trigger, user, session }) {
      if (trigger === "update" && session?.user?.username) {
        token.name = session.user.username;
      }
      if (user) {
        // User is available during sign-in
        token.name = user.username;
      }

      return token;
    },
    session({ session, token }) {
      return session;
    },
  },
  credentials: {
    username: {},
    password: {},
  },
  pages: {
    error: "/error",
    newUser: "/signup",
    signIn: "/login",
  },
  ...authConfig,
});
