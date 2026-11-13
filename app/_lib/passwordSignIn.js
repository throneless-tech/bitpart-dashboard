import { isPlaceholderEmail } from "@/app/_lib/placeholderEmail";

// sign in with a username or an email address and a password, from the
// browser (so /api/auth rate limits apply). usernames can contain "@" too, so
// try the username if it isn't an email that works. placeholders aren't real
// addresses, so they can't be used to log in. returns better auth's
// { data, error }; data.twoFactorRedirect means a second factor is needed.
export const passwordSignIn = async (signIn, identifier, password) => {
  if (!identifier || !password) {
    return {
      data: null,
      error: { message: "Enter your username and password" },
    };
  }

  if (identifier.includes("@") && !isPlaceholderEmail(identifier)) {
    const result = await signIn.email({ email: identifier, password });

    if (!result.error) {
      return result;
    }
  }

  return signIn.username({ username: identifier, password });
};
