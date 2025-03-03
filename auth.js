import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from '@/lib/prisma'

import { LoginSchema } from "./app/lib/definitions"

// // Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    // async signIn({ user, credentials }) {
    //   console.log('*****************************');
    //   console.log('in sign in callback...');

    //   console.log('*****************************');

    //   // Check if this sign in callback is being called in the credentials authentication flow.
    //   // If so, use the next - auth adapter to create a session entry in the database
    //   // (SignIn is called after authorize so we can safely assume the user is valid and already authenticated).
    //   if (credentials && credentials.username && credentials.password) {
    //     if (user) {
    //       const sessionToken = crypto.randomUUID();
    //       // Set expiry to 30 days
    //       const sessionExpiry = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);

    //       await PrismaAdapter(prisma).createSession({
    //         sessionToken: sessionToken,
    //         userId: user.id,
    //         expires: sessionExpiry
    //       });

    //       event.cookies.set('next-auth.session-token', sessionToken, {
    //         expires: sessionExpiry
    //       });
    //     }
    //   }

    //   return true;
    // },
    jwt({ token, user }) {
      if (user?.username) { // User is available during sign-in
        token.username = user.username
      }
      return token
    },
    session({ session, token, user }) {
      session.user.username = token.username

      return session
    },
  },
  debug: !!process.env.AUTH_DEBUG,
  credentials: {
    username: {},
    password: {},
  },
  pages: {
    signIn: "/",
    error: "/error",
  },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          let user = null

          // 1. Validate form fields
          const validatedFields = await LoginSchema.validate(credentials)

          // 2. Prepare data for insertion into database
          const { username, password } = validatedFields

          // Hash the user's password before storing it when creating a new user
          // const hashedPassword = await bcrypt.hash(password, 10)

          // 3. Insert the user into the database or verify if the user exists
          user = await prisma.user.findUnique({
            where: {
              username: username,
            },
          })

          if (!user) {
            throw new Error("Invalid credentials.")
          }

          const isPasswordValid = bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid email or password.')
          }


          // return JSON object with the user data
          return user
        } catch (error) {

          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
})