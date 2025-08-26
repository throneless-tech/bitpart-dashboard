"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { LoginSchema } from "../_lib/definitions";

export const register = async (prevState, formData) => {
  let redirectPath = null;

  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");
  const username = formData.get("username");
  const email = formData.get("email");

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

    const userFound = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userFound) {
      return {
        error: {
          username: "A user with these credentials already exists.",
        },
      };
    }

    const inviteCode = await prisma.inviteCode.findUnique({
      where: {
        code: formData.get("code"),
      },
    });

    if (!inviteCode) {
      return {
        error: {
          code: "Invite code is not valid. Please try again.",
        },
      };
    } else if (inviteCode.used) {
      return {
        error: {
          code: "Invite code has already been used. Please enter a different code or contact an administrator.",
        },
      };
    }

    const updateInviteCode = await prisma.inviteCode.update({
      where: {
        code: inviteCode.code,
      },
      data: {
        used: true,
      },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

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
