import NextAuth from "next-auth"
import authConfig from "./auth.config"

import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  adapter: PrismaAdapter(prisma),
  session: {
    maxAge: 60 * 60,
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, trigger, user, account }) {
      if (trigger === "update") token.name = session.user.username
      // if (account?.provider === "credentials") {
      //   token.credentials = true;
      // }
      // if (user?.username) { // User is available during sign-in
        // token.name = user.username
      // }
      if (user) {
        console.log('USER::::::::::::: ', user);
        
        token.bots = user.bots
      }
      return token
    },
    session({ session, token }) {
      if (token?.name) session.name = token.name

      session.user.bots = token.bots

      return session
    },
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
    signIn: "/",
  },
  ...authConfig,
})