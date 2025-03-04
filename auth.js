import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from '@/lib/prisma'

import { LoginSchema } from "./app/lib/definitions"

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
    //       // Set expiry to 1 day
    //       const sessionExpiry = new Date(Date.now() + 60 * 60 * 24 * 1000);

    //       const createdSession = await PrismaAdapter(prisma).createSession({
    //         sessionToken: sessionToken,
    //         userId: user.id,
    //         expires: sessionExpiry,
    //       });

    //       if (!createdSession) return false;
    //     }
    //   }

    //   return true;
    // },
    jwt({ token, user, account }) {
      // if (account?.provider === "credentials") {
      //   token.credentials = true;
      // }
      if (user?.username) { // User is available during sign-in
        token.username = user.username
      }
      return token
    },
    async redirect({url, baseUrl}) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url

      return baseUrl
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
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    error: "/error",
    signIn: "/",
  },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          let user = null

          // 1. Validate form fields
          const validatedFields = await LoginSchema.validate(credentials)

          // If any form fields are invalid, return early
          if (!validatedFields.success) {
            return {
              errors: validatedFields.error.flatten().fieldErrors,
            }
          } 

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