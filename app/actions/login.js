"use server";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/app/auth";

export const login = async (prevState, formData) => {
  const password = formData.get("password");
  const username = formData.get("username");

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: true,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/error?error=${error.type}`);
    }
    throw error;
  }
};
