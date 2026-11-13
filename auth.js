import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { MIN_PASSWORD_LENGTH } from "@/app/_lib/definitions";
import { authMailCallback } from "@/app/_lib/authMail";
import { realEmail } from "@/app/_lib/placeholderEmail";

export const authOptions = {
  secret:
    process.env.BETTER_AUTH_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.APP_URL,
  emailAndPassword: {
    enabled: true,
    // sign-up sends people to the login page
    autoSignIn: false,
    // unconfirmed users can log in
    requireEmailVerification: false,
    // only checked for new passwords; logging in doesn't check it, so older
    // accounts with shorter passwords still work
    minPasswordLength: MIN_PASSWORD_LENGTH,
    // existing hashes are bcrypt
    password: {
      hash: (password) => bcrypt.hash(password, 10),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
    sendResetPassword: authMailCallback("reset-password"),
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    // sent by the register action, only for real addresses. also sends the
    // link to the new address when a confirmed email is changed.
    sendVerificationEmail: authMailCallback("verify-email"),
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
    expiresIn: 24 * 60 * 60,
  },
  user: {
    additionalFields: {
      pendingEmail: { type: "string", required: false, input: false },
      notifyBotIssues: { type: "boolean", defaultValue: true, input: false },
      consent_agree: { type: "boolean", defaultValue: false, input: false },
    },
    // an unconfirmed address (or a placeholder) is replaced straight away; a
    // confirmed one stays until the link sent to the new address is opened
    changeEmail: { enabled: true, updateEmailWithoutVerification: true },
  },
  session: {
    expiresIn: 60 * 60,
    updateAge: 5 * 60,
    // no cookie cache, so ending a session takes effect straight away
    cookieCache: { enabled: false },
  },
  // the default rules already limit every /sign-in/* path (email and
  // username) the same way. only applies to requests to /api/auth.
  rateLimit: { enabled: true, storage: "database" },
  advanced: {
    // ingress-nginx sets x-real-ip to the address that connected to it, the
    // same one clientIp() takes from x-forwarded-for with one trusted proxy
    ipAddress: { ipAddressHeaders: ["x-real-ip", "x-forwarded-for"] },
  },
  // the server actions in app/_actions are the only way into these flows
  // (they add the password checks, sign-up limits and email handling), so
  // they aren't reachable over /api/auth
  disabledPaths: [
    "/sign-up/email",
    "/update-user",
    "/change-email",
    "/change-password",
    "/verify-email",
    "/send-verification-email",
    "/request-password-reset",
    "/reset-password",
    "/is-username-available",
  ],
  plugins: [
    username({
      // usernames are used as typed (in bot ids too), so don't change them
      usernameNormalization: false,
      displayUsername: false,
      minUsernameLength: 1,
      maxUsernameLength: 1000,
      usernameValidator: () => true,
    }),
    // must be last
    nextCookies(),
  ],
};

export const betterAuthServer = betterAuth({
  ...authOptions,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
});

// the logged in user, in the shape the pages use: session.user.name is the
// username
export const auth = async () => {
  const session = await betterAuthServer.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.username,
      email: realEmail(session.user),
    },
  };
};
