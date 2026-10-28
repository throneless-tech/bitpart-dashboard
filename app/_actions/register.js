"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginSchema } from "../_lib/definitions";
import { sendVerificationEmail } from "@/app/_lib/accountEmails";
import {
  clientIp,
  recordSignup,
  signupAllowed,
} from "@/app/_lib/signupRateLimit";

export const register = async (prevState, formData) => {
  let redirectPath = null;

  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");
  const username = formData.get("username");
  // email is optional; normalize a blank field to null so it doesn't collide
  // on the unique constraint or match other email-less accounts
  const email = formData.get("email")?.trim() || null;

  try {
    // validate form fields
    const validatedFields = await LoginSchema.validate({ username, password });

    // If any form fields are invalid, return early
    if (!validatedFields.username || !validatedFields.password) {
      return {
        error: validatedFields,
      };
    }

    // If the passwords do not match, return early
    if (password !== passwordConfirm) {
      return {
        error: {
          passwordConfirm: "Passwords do not match.",
        },
      };
    }

    const ip = clientIp(await headers());

    if (!(await signupAllowed(ip))) {
      return {
        error: {
          general:
            "Too many accounts have been created from your network recently. Please try again later.",
        },
      };
    }

    const userFound = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email
            ? [
                { email: { equals: email, mode: "insensitive" } },
                { pendingEmail: { equals: email, mode: "insensitive" } },
              ]
            : []),
        ],
      },
    });

    if (userFound) {
      return {
        error: {
          username: "A user with these credentials already exists.",
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    await recordSignup(ip);

    if (email) {
      try {
        await sendVerificationEmail(user);
      } catch (error) {
        // the account is created either way; they can resend from settings
        console.error("Failed to send confirmation email", error);
      }
    }

    redirectPath = "/login?message=SignUpSuccess";
  } catch (e) {
    console.log(e);

    return {
      error: {
        general: e.message,
      },
    };
  } finally {
    if (redirectPath) {
      return redirect(redirectPath); // eslint-disable-line no-unsafe-finally
    }
  }
};
