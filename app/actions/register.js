"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { LoginSchema } from "../lib/definitions";

export const register = async (prevState, formData) => {
  let redirectPath = null;

  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");
  const username = formData.get("username");

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

    const userFound = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (userFound) {
      return {
        error: {
          username: "Username already exists.",
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: user.id,
      },
    });

    redirectPath = "/login?message=SignUpSuccess";

    return user && account;
  } catch (e) {
    console.log(e);

    return {
      error: {
        password: e.message,
      },
    };
  } finally {
    if (redirectPath) {
      return redirect(redirectPath); // eslint-disable-line no-unsafe-finally
    }
  }
};
