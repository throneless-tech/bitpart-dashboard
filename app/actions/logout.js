"use server";
import { isRedirectError } from "next/dist/client/components/redirect";
import { signOut } from "@/auth";

export const logout = async () => {
  try {
    await signOut({ redirect: false });

    return {
      success: true,
      message: "Your account has been successfully logged in.",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      return { success: false, message: formatError(error) };
    }
    return { success: false, message: error.type };
  }
};
