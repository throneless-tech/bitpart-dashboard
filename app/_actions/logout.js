"use server";
import { unstable_rethrow } from "next/navigation";
import { signOut } from "@/auth";

export const logout = async () => {
  try {
    await signOut({ redirect: false });

    return {
      success: true,
      message: "Your account has been successfully logged out.",
    };
  } catch (error) {
    unstable_rethrow(error);
    return { success: false, message: error.type };
  }
};
