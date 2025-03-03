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
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          let user = null

          // 1. Validate form fields
          const validatedFields = await LoginSchema.validate(credentials)

          // 2. Prepare data for insertion into database
          const { username, password } = validatedFields
          
          // Hash the user's password before storing it
          const hashedPassword = await bcrypt.hash(password, 10)

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
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id
            token.username = user.username
          }
          return token
        },
        async session({ session, token }) {
          if (token) {
            session.user.id = token.id
            session.user.username = token.username
          }
          return session
        },
      },
      credentials: {
        username: {},
        password: {},
      },
      pages: {
        signIn: "/",
        error: "/error",
      },
      session: {
        strategy: 'jwt',
      },
      secret: process.env.JWT_SECRET, // optional
    }),
  ],
})