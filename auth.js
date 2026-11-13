import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";
import { twoFactor } from "better-auth/plugins/two-factor";
import { passkey } from "@better-auth/passkey";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { MIN_PASSWORD_LENGTH } from "@/app/_lib/definitions";
import { authMailCallback } from "@/app/_lib/authMail";
import { EMAIL_CODE_MINUTES } from "@/app/_lib/accountEmails";
import { sendTwoFactorOTP, twoFactorMethods } from "@/app/_lib/mfa";
import { loginTelemetry } from "@/app/_lib/authTelemetry";
import { realEmail } from "@/app/_lib/placeholderEmail";

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.APP_URL;

// passkeys are bound to the site's hostname (dev and prod differ)
const siteURL = baseURL ? new URL(baseURL) : null;

export const authOptions = {
  secret:
    process.env.BETTER_AUTH_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET,
  baseURL,
  appName: "Bitpart",
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
      emailOtpEnabled: { type: "boolean", defaultValue: false, input: false },
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
    // adding a passkey needs a login in the last 10 minutes
    freshAge: 10 * 60,
  },
  // the default rules already limit every /sign-in/* path (email and
  // username) the same way. only applies to requests to /api/auth, which is
  // why the login steps below are called from the browser.
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      // second-factor codes are 6 digits
      "/two-factor/*": { window: 60, max: 5 },
      "/passkey/*": { window: 60, max: 10 },
    },
  },
  advanced: {
    // ingress-nginx sets x-real-ip to the address that connected to it, the
    // same one clientIp() takes from x-forwarded-for with one trusted proxy
    ipAddress: { ipAddressHeaders: ["x-real-ip", "x-forwarded-for"] },
  },
  // the split between the browser and server actions:
  // - the browser (app/_lib/authClient.js) calls the login steps, so they get
  //   the rate limits: /sign-in/*, /two-factor/send-otp and verify-*,
  //   /passkey/generate-authenticate-options and verify-authentication, and
  //   adding a passkey (webauthn has to run there), plus get-session and
  //   sign-out.
  // - everything else goes through the server actions in app/_actions,
  //   which add the password checks, sign-up limits and email handling, so
  //   it isn't reachable over /api/auth.
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
    "/two-factor/enable",
    "/two-factor/disable",
    "/two-factor/generate-backup-codes",
    "/two-factor/get-totp-uri",
    "/passkey/list-user-passkeys",
    "/passkey/delete-passkey",
    "/passkey/update-passkey",
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
    twoFactor({
      issuer: "Bitpart",
      otpOptions: {
        sendOTP: sendTwoFactorOTP,
        period: EMAIL_CODE_MINUTES,
        storeOTP: "hashed",
      },
    }),
    // after twoFactor, to fix up the methods it lists
    twoFactorMethods(),
    // after twoFactorMethods, to see the final response
    loginTelemetry(),
    passkey({
      rpID: siteURL?.hostname,
      rpName: "Bitpart",
      origin: siteURL?.origin,
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
