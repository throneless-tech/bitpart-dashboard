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
    jwt({ token, trigger, user, account }) {
      if (trigger === "update") token.name = session.user.username;
      // if (account?.provider === "credentials") {
      //   token.credentials = true;
      // }
      if (user) {
        // User is available during sign-in
        // token.id = user.id;
        token.name = user.username;
      }

      return token;
    },
    session({ session, token }) {
      // if (token?.id) session.id = token.id;
      // if (token?.name) session.name = token.name;

      return session;
    },
    newUser(props) {
      console.log('****************************');
      console.log(props);
      console.log('****************************');
      
      
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
    newUser: "/signup",
    signIn: "/login",
  },
  ...authConfig,
});
