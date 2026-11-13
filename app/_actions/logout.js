"use server";
import { headers } from "next/headers";
import { betterAuthServer } from "@/auth";

export const logout = async () => {
  try {
    await betterAuthServer.api.signOut({ headers: await headers() });

    return {
      success: true,
      message: "Your account has been successfully logged out.",
    };
  } catch (error) {
    console.error("ERROR: ", error);
    return { success: false, message: error.message };
  }
};
