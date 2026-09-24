"use server";
import { AuthError } from "next-auth";
import { unstable_rethrow } from "next/navigation";
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
    unstable_rethrow(error);
    return { success: false, message: error.type };
  }
};
