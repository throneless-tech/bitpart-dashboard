import NextAuth from "next-auth"
import authConfig from "./auth.config"

import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // async signIn({ user, credentials }) {
    //   console.log('*****************************');
    //   console.log('in sign in callback...');
    //   console.log("user: ", user);
    //   console.log("credentials: ", credentials);
      

    //   console.log('*****************************');

    //   // Check if this sign in callback is being called in the credentials authentication flow.
    //   // If so, use the next - auth adapter to create a session entry in the database
    //   // (SignIn is called after authorize so we can safely assume the user is valid and already authenticated).
    //   // if (credentials && credentials.username && credentials.password) {
    //   //   if (user) {
    //   //     const sessionToken = crypto.randomUUID();
    //   //     // Set expiry to 1 day
    //   //     const sessionExpiry = new Date(Date.now() + 60 * 60 * 24 * 1000);

    //   //     const createdSession = await PrismaAdapter(prisma).createSession({
    //   //       sessionToken: sessionToken,
    //   //       userId: user.id,
    //   //       expires: sessionExpiry,
    //   //     });

    //   //     if (!createdSession) return false;
    //   //   }
    //   // }

    //   // return true;
    // },
    jwt({ token, trigger, user, account }) {
      if (trigger === "update") token.name = session.user.username
      // if (account?.provider === "credentials") {
      //   token.credentials = true;
      // }
      if (user?.username) { // User is available during sign-in
        token.name = user.username
      }
      return token
    },
    // async redirect({url, baseUrl}) {
    //   // Allows relative callback URLs
    //   if (url.startsWith("/")) return `${baseUrl}${url}`

    //   // Allows callback URLs on the same origin
    //   if (new URL(url).origin === baseUrl) return url

    //   return baseUrl
    // },
    session({ session, token }) {
      if (token?.name) session.name = token.name

      // session.user.username = token.username

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