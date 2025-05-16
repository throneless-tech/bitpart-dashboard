"use server";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect";
import { signIn } from "@/auth";

export const login = async (formData) => {
  const password = formData.get("password");
  const username = formData.get("username");

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: "Your account has been successfully logged in.",
    };
  } catch (error) {
    // if (error instanceof AuthError) {
    //   return redirect(`/error?error=${error.type}`);
    // }
    if (isRedirectError(error)) {
      return { success: false, message: formatError(error) };
    }
    return { success: false, message: error.type };
  }
};
