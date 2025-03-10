import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma'
import type { NextAuthConfig } from "next-auth"

import { LoginSchema } from "./app/lib/definitions"

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          let user = null

          // 1. Validate form fields
          const validatedFields = await LoginSchema.validate(credentials)

          // If any form fields are invalid, return early
          if (!validatedFields.username  || !validatedFields.password) {
            return {
              errors: validatedFields,
            }
          }

          // 2. Prepare data for insertion into database
          const { username, password } = validatedFields

          // Hash the user's password before storing it when creating a new user
          // const hashedPassword = await bcrypt.hash(password, 10)

          // 3. Insert the user into the database or verify if the user exists
          user = await prisma.user.findUnique({
            include: {
              bots: true,
            },
            where: {
              username: username,
            },
          })

          if (!user) {
            throw new Error("Invalid credentials.")
          }

          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid email or password.')
          }

          // return JSON object with the user data          
          return user
        } catch (error) {
          console.error("ERROR: ", error);
          return null
        }
      },
    }),
  ],
} satisfies NextAuthConfig