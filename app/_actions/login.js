"use server";
import { headers } from "next/headers";
import { betterAuthServer } from "@/auth";
import { LoginSchema } from "@/app/_lib/definitions";
import { isPlaceholderEmail } from "@/app/_lib/placeholderEmail";

const signInWithEmail = async (email, password) => {
  // placeholders aren't real addresses, so they can't be used to log in
  if (isPlaceholderEmail(email)) {
    return false;
  }

  try {
    await betterAuthServer.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    return true;
  } catch {
    return false;
  }
};

// the login form takes a username or an email address. usernames can contain
// "@" too, so try the username if it isn't an email that works.
export const login = async (formData) => {
  const password = formData.get("password");
  const username = formData.get("username");

  try {
    await LoginSchema.validate({ username, password });

    if (
      !(username.includes("@") && (await signInWithEmail(username, password)))
    ) {
      await betterAuthServer.api.signInUsername({
        body: { username, password },
        headers: await headers(),
      });
    }

    return {
      success: true,
      message: "Your account has been successfully logged in.",
    };
  } catch (error) {
    console.error("ERROR: ", error);
    return { success: false, message: "CredentialsSignin" };
  }
};
