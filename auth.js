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
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        // email: {},
        password: {},
      },
      pages: {
        signIn: "/",
        error: "/error",
      },
      authorize: async (credentials) => {
        try {
          let user = null

          // 1. Validate form fields
          const validatedFields = await LoginSchema.validate(credentials)

          // 2. Prepare data for insertion into database
          const { password } = validatedFields
          // e.g. Hash the user's password before storing it
          const hashedPassword = await bcrypt.hash(password, 10)

          // 3. Insert the user into the database or verify if the user exists
          user = await prisma.user.findUnique({
            where: {
              password: hashedPassword,
            },
          })

          if (!user) {
            throw new Error("Invalid credentials.")
          }

          // return JSON object with the user data
          return user
        } catch (error) {

          return null
        }
      },
    }),
  ],
})