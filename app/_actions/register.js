"use server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { betterAuthServer } from "@/auth";
import { SignupSchema } from "../_lib/definitions";
import { collectAuthMail, sendAuthMail } from "@/app/_lib/authMail";
import {
  isPlaceholderEmail,
  newPlaceholderEmail,
} from "@/app/_lib/placeholderEmail";
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
  const email = formData.get("email")?.trim().toLowerCase() || null;

  try {
    // validate form fields
    try {
      await SignupSchema.validate({ username, password });
    } catch (validationError) {
      return {
        error: {
          [validationError.path ?? "general"]: validationError.message,
        },
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

    if (userFound || isPlaceholderEmail(email)) {
      return {
        error: {
          username: "A user with these credentials already exists.",
        },
      };
    }

    await betterAuthServer.api.signUpEmail({
      body: {
        email: email ?? newPlaceholderEmail(),
        password,
        name: username,
        username,
      },
    });

    await recordSignup(ip);

    if (email) {
      try {
        const { mail } = await collectAuthMail(() =>
          betterAuthServer.api.sendVerificationEmail({ body: { email } }),
        );
        await sendAuthMail(mail);
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
