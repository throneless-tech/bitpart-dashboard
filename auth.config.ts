import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt"
import { LoginSchema } from "./app/lib/definitions";
import { PrismaAdapter } from "@auth/prisma-adapter";

const adapter = PrismaAdapter(prisma)
import { v4 as uuid } from "uuid"

const authConfig: NextAuthConfig = {
  adapter,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          let user = null;

          // 1. Validate form fields
          const validatedFields = await LoginSchema.validate(credentials);

          // If any form fields are invalid, return early
          if (!validatedFields.username || !validatedFields.password) {
            return {
              errors: validatedFields,
            };
          }

          // 2. Prepare data for insertion into database
          const { username, password } = validatedFields;

          // Hash the user's password before storing it when creating a new user
          // const hashedPassword = await bcrypt.hash(password, 10)

          // 3. Insert the user into the database or verify if the user exists
          user = await prisma.user.findUnique({
            where: {
              username: username,
            },
          });

          if (!user) {
            throw new Error("Invalid credentials.");
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid credentials.");
          }

          // return JSON object with the user data
          return user;
        } catch (error) {
          console.error("ERROR: ", error);
          return null;
        }
      },

    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true
      }
      return token
    },
  },
  jwt: {
    encode: async function (params) {
      console.log("PARAMS ****", params)
      if (params.token?.credentials) {
        const sessionToken = uuid()

        if (!params.token.sub) {
          throw new Error("No user ID found in token")
        }

        const createdSession = await prisma.session.create({
          data: {
            sessionToken: sessionToken,
            userId: params.token.sub,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          }
        })

        if (!createdSession) {
          throw new Error("Failed to create session")
        }

        return sessionToken
      }
      return defaultEncode(params)
    },
  },
}

export default authConfig;