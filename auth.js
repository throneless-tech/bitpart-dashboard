import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";

const adapter = PrismaAdapter(prisma)

export const {
  auth,
  handlers,
  newUser,
  signIn,
  signOut,
} = NextAuth({
  adapter,
  debug: !!process.env.AUTH_DEBUG,
  pages: {
    error: "/error",
    newUser: "/signup",
    signIn: "/login",
  },
  ...authConfig,
});
