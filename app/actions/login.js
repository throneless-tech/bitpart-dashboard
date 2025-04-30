"use server";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export const login = async (prevState, formData) => {
  const password = formData.get("password");
  const username = formData.get("username");

  try {
    const signedIn = await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/error?error=${error.type}`);
    }
    throw error;
  }
};
