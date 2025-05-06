import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, newUser, auth } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  adapter: PrismaAdapter(prisma),
  session: {
    maxAge: 60 * 60,
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, trigger, user, account }) {      
      if (trigger === "update") token.name = session.user.username;
      // if (account?.provider === "credentials") {
      //   token.credentials = true;
      // }
      if (user) {
        // User is available during sign-in
        token.id = user.id;
        token.name = user.username;
      }

      return token;
    },
    session({ session, token }) {
      if (token?.id) session.id = token.id;
      if (token?.name) session.name = token.name;

      return session;
    },
    // async signIn({ profile }) {

    // }
  },
  credentials: {
    username: {},
    password: {},
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    error: "/error",
    newUser: "/signup",
    signIn: "/login",
  },
  ...authConfig,
});
