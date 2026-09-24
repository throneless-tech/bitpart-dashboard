"use server";
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
    unstable_rethrow(error);
    return { success: false, message: error.type };
  }
};
