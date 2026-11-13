"use server";
import { traceAction } from "@/app/_lib/otel";
import { errorFields, logger } from "@/app/_lib/logger";
import { headers } from "next/headers";
import { betterAuthServer } from "@/auth";

export const logout = traceAction("action.logout", async () => {
  try {
    await betterAuthServer.api.signOut({ headers: await headers() });

    return {
      success: true,
      message: "Your account has been successfully logged out.",
    };
  } catch (error) {
    logger.error(errorFields(error), "logout failed");
    return { success: false, message: error.message };
  }
});
