"use server";
import { traceAction } from "@/app/_lib/otel";
import { errorFields, logger } from "@/app/_lib/logger";
import { recordAccountEvent } from "@/app/_lib/events";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "better-auth/crypto";
import { prisma } from "@/lib/prisma";
import { betterAuthServer } from "@/auth";
import { getUser } from "./getUser";
import { getVerifiedUser } from "@/app/_lib/verifiedUser";
import { canUseEmailCodes } from "@/app/_lib/mfa";
import { collectAuthMail, sendAuthMail } from "@/app/_lib/authMail";
import { clearMailThrottle, clearResetTokens } from "@/app/_lib/mailThrottle";
import {
  sendEmailChangedNotice,
  sendPasswordChangedNotice,
} from "@/app/_lib/accountEmails";
import {
  isPlaceholderEmail,
  newPlaceholderEmail,
  realEmail,
} from "@/app/_lib/placeholderEmail";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_LENGTH_MESSAGE,
} from "@/app/_lib/definitions";

const RESET_REQUESTED_MESSAGE =
  "If an account with an email address matches, we've sent it a link to reset the password. The link expires in 1 hour.";

const INVALID_CONFIRMATION_LINK =
  "This confirmation link is invalid or has expired.";

const EMAIL_TAKEN_ON_CONFIRM =
  "This email address is now used by another account. Please choose a different one.";

const normalizeEmail = (value) => value?.trim().toLowerCase() || null;

// match emails case-insensitively, in case any were stored as typed
const emailIs = (email) => ({ equals: email, mode: "insensitive" });

const isUniqueViolation = (error) =>
  error?.code === "P2002" || error?.cause?.code === "P2002";

const checkNewPassword = (password, passwordConfirm) => {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return PASSWORD_LENGTH_MESSAGE;
  }

  if (password !== passwordConfirm) {
    return "Passwords do not match.";
  }

  return null;
};

// log a mail failure without revealing it (or whether the account exists)
const trySend = async (label, send) => {
  try {
    return await send();
  } catch (error) {
    logger.warn({ email_kind: label, ...errorFields(error) }, "email not sent");
    return false;
  }
};

// run a better auth call and send the emails it produced. returns whether
// they were sent; errors from the call itself are thrown.
const callAndSend = async (label, call) => {
  const { mail } = await collectAuthMail(call);

  return trySend(label, () => sendAuthMail(mail));
};

const emailInUse = async (email, userId) =>
  !!(await prisma.user.findFirst({
    where: {
      id: { not: userId },
      OR: [{ email: emailIs(email) }, { pendingEmail: emailIs(email) }],
    },
    select: { id: true },
  }));

// what the settings page shows about the logged in user
export const getAccountSettings = async (username) => {
  const user = await getUser(username);

  if (!user) {
    return null;
  }

  return {
    username: user.username,
    email: realEmail(user),
    emailVerified: !!realEmail(user) && !!user.emailVerified,
    pendingEmail: user.pendingEmail,
    notifyBotIssues: user.notifyBotIssues,
    security: await securitySettings(user),
  };
};

// which second factors and passkeys the user has; never secrets
const securitySettings = async (user) => {
  const twoFactor = await prisma.twoFactor.findUnique({
    where: { userId: user.id },
    select: { verified: true },
  });

  let backupCodesRemaining = 0;

  if (twoFactor) {
    try {
      const { backupCodes } = await betterAuthServer.api.viewBackupCodes({
        body: { userId: user.id },
      });
      backupCodesRemaining = backupCodes.length;
    } catch (error) {
      logger.error(errorFields(error), "failed to read backup codes");
    }
  }

  const passkeys = await prisma.passkey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    totp: !!twoFactor?.verified,
    emailCodes: !!user.emailOtpEnabled,
    canUseEmailCodes: canUseEmailCodes(user),
    hasBackupCodes: !!twoFactor,
    backupCodesRemaining,
    passkeys,
  };
};

export const setBotIssueNotifications = traceAction(
  "action.setBotIssueNotifications",
  async (username, enabled) => {
    const user = await getUser(username);

    if (!user) {
      return { error: "You must be logged in to do this." };
    }

    if (enabled && !realEmail(user)) {
      return { error: "Add an email address to turn on notifications." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { notifyBotIssues: !!enabled },
    });

    return {
      success: enabled
        ? "You'll get an email when one of your bots has a problem."
        : "Bot problem emails are turned off.",
    };
  },
);

// forgot password: always gives the same answer, so it can't be used to find
// out which accounts exist
export const requestPasswordReset = traceAction(
  "action.requestPasswordReset",
  async (prevState, formData) => {
    const identifier = formData.get("identifier")?.trim();

    if (!identifier) {
      return { error: { identifier: "Enter your username or email address." } };
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: emailIs(identifier) }],
      },
    });

    // resets go to User.email only: the confirmed address, or the only
    // (unconfirmed) one if none has been confirmed. pendingEmail never gets one.
    const email = realEmail(user);

    if (email) {
      recordAccountEvent("password_reset_requested", user.id);
      await trySend("password reset", () =>
        callAndSend("password reset", () =>
          betterAuthServer.api.requestPasswordReset({ body: { email } }),
        ),
      );
    }

    return { success: RESET_REQUESTED_MESSAGE };
  },
);

export const resetPassword = traceAction(
  "action.resetPassword",
  async (prevState, formData) => {
    const password = formData.get("password");
    const invalid = checkNewPassword(password, formData.get("passwordConfirm"));

    if (invalid) {
      return { error: { password: invalid } };
    }

    const token = formData.get("token");

    try {
      if (!token || typeof token !== "string") {
        throw new Error("No reset token");
      }

      // also ends the user's sessions (revokeSessionsOnPasswordReset)
      await betterAuthServer.api.resetPassword({
        body: { newPassword: password, token },
      });
    } catch {
      return {
        error: {
          general:
            "This reset link is invalid or has expired. Please request a new one.",
        },
      };
    }

    recordAccountEvent("password_reset");
    redirect("/login?message=PasswordResetSuccess");
  },
);

// confirms an address from a better auth link: either the user's own
// address, or the new one of an email change
export const verifyEmail = traceAction("action.verifyEmail", async (token) => {
  if (!token || typeof token !== "string") {
    return { error: INVALID_CONFIRMATION_LINK };
  }

  // the same check better auth makes; read here to look at what it's for
  const payload = await verifyJWT(
    token,
    (await betterAuthServer.$context).secret,
  );
  const user = payload?.userId
    ? await prisma.user.findUnique({ where: { id: payload.userId } })
    : null;

  if (!user || typeof payload.email !== "string") {
    return { error: INVALID_CONFIRMATION_LINK };
  }

  const newEmail = payload.updateTo;

  if (newEmail) {
    // change links can't be revoked, so only the change still waiting counts:
    // a cancelled or replaced change's link is refused
    if (
      payload.requestType !== "change-email-verification" ||
      user.pendingEmail?.toLowerCase() !== newEmail.toLowerCase()
    ) {
      return { error: INVALID_CONFIRMATION_LINK };
    }

    const taken = await prisma.user.findFirst({
      where: { id: { not: user.id }, email: emailIs(newEmail) },
      select: { id: true },
    });

    if (taken) {
      return { error: EMAIL_TAKEN_ON_CONFIRM };
    }
  } else if (!realEmail({ email: payload.email })) {
    return { error: INVALID_CONFIRMATION_LINK };
  }

  try {
    // no session headers: the link works whoever is logged in, as before
    await betterAuthServer.api.verifyEmail({ query: { token } });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: EMAIL_TAKEN_ON_CONFIRM };
    }
    return { error: INVALID_CONFIRMATION_LINK };
  }

  if (!newEmail) {
    recordAccountEvent("email_verified", user.id);
    return { email: payload.email };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { pendingEmail: null },
  });

  const oldEmail = realEmail({ email: payload.email });

  if (oldEmail) {
    await trySend("email changed notice", () =>
      sendEmailChangedNotice({
        username: user.username,
        oldEmail,
        newEmail,
      }),
    );
  }

  recordAccountEvent("email_changed", user.id);
  return { email: newEmail };
});

export const resendVerificationEmail = traceAction(
  "action.resendVerificationEmail",
  async (username) => {
    const user = await getUser(username);

    if (!user) {
      return { error: "You must be logged in to do this." };
    }

    const email = realEmail(user);
    let sent = false;

    if (user.pendingEmail) {
      // a new link for the change that is waiting. a change left over from
      // before better auth, from an unconfirmed address, now applies at once.
      sent = await trySend("confirmation", () =>
        callAndSend("confirmation", async () =>
          betterAuthServer.api.changeEmail({
            body: { newEmail: user.pendingEmail },
            headers: await headers(),
          }),
        ),
      );

      await prisma.user.updateMany({
        where: { id: user.id, email: user.pendingEmail.toLowerCase() },
        data: { pendingEmail: null },
      });
    } else if (email && !user.emailVerified) {
      sent = await trySend("confirmation", () =>
        callAndSend("confirmation", async () =>
          betterAuthServer.api.sendVerificationEmail({
            body: { email },
            headers: await headers(),
          }),
        ),
      );
    }

    return sent
      ? { success: "Confirmation email sent. Check your inbox." }
      : {
          error:
            "We couldn't send a confirmation email right now. If you just requested one, wait a couple of minutes and try again.",
        };
  },
);

export const changeEmail = traceAction(
  "action.changeEmail",
  async (prevState, formData) => {
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      formData.get("currentPassword"),
    );

    if (error) {
      return { error };
    }

    const email = normalizeEmail(formData.get("email"));

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      isPlaceholderEmail(email)
    ) {
      return { error: { email: "Enter a valid email address." } };
    }

    const current = realEmail(user);

    if (email === current?.toLowerCase()) {
      return { error: { email: "This is already your email address." } };
    }

    if (await emailInUse(email, user.id)) {
      return { error: { email: "This email address is already in use." } };
    }

    // a confirmed address stays until the new one is confirmed. otherwise
    // (unconfirmed or no address) better auth switches to the new one straight
    // away, unconfirmed.
    const pending = !!current && !!user.emailVerified;

    // a new address gets its link straight away, like a new token used to
    await clearMailThrottle("verify-email", user.id);

    let mail;

    try {
      ({ mail } = await collectAuthMail(async () =>
        betterAuthServer.api.changeEmail({
          body: { newEmail: email },
          headers: await headers(),
        }),
      ));
    } catch (err) {
      if (isUniqueViolation(err)) {
        return { error: { email: "This email address is already in use." } };
      }
      throw err;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { pendingEmail: pending ? email : null },
    });
    recordAccountEvent(
      pending ? "email_change_requested" : "email_changed",
      user.id,
    );

    const sent = await trySend("confirmation", () => sendAuthMail(mail));

    return {
      success: sent
        ? `We've sent a confirmation link to ${email}.`
        : `Saved, but we couldn't send a confirmation link to ${email}. Try "Resend confirmation email" in a few minutes.`,
    };
  },
);

export const cancelEmailChange = traceAction(
  "action.cancelEmailChange",
  async (username) => {
    const user = await getUser(username);

    if (!user) {
      return { error: "You must be logged in to do this." };
    }

    // verifyEmail refuses the change's link once pendingEmail is cleared
    await prisma.user.update({
      where: { id: user.id },
      data: { pendingEmail: null },
    });
    await clearMailThrottle("verify-email", user.id);

    return { success: "Email change cancelled." };
  },
);

export const removeEmail = traceAction(
  "action.removeEmail",
  async (prevState, formData) => {
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      formData.get("currentPassword"),
    );

    if (error) {
      return { error };
    }

    // email sign-in codes need the address
    if (user.emailOtpEnabled) {
      return {
        error: {
          general:
            "Turn off email sign-in codes (under Security) before removing your email address.",
        },
      };
    }

    // links sent to the old address stop working, as it's no longer the user's
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newPlaceholderEmail(),
        emailVerified: false,
        pendingEmail: null,
      },
    });
    await clearResetTokens(user.id);
    await clearMailThrottle("verify-email", user.id);
    await clearMailThrottle("reset-password", user.id);

    recordAccountEvent("email_removed", user.id);
    return { success: "Your email address has been removed." };
  },
);

export const changePassword = traceAction(
  "action.changePassword",
  async (prevState, formData) => {
    const currentPassword = formData.get("currentPassword");
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      currentPassword,
    );

    if (error) {
      return { error };
    }

    const password = formData.get("password");
    const invalid = checkNewPassword(password, formData.get("passwordConfirm"));

    if (invalid) {
      return { error: { password: invalid } };
    }

    const requestHeaders = await headers();

    try {
      await betterAuthServer.api.changePassword({
        body: {
          currentPassword,
          newPassword: password,
          revokeOtherSessions: true,
        },
        headers: requestHeaders,
      });
    } catch (err) {
      return { error: { general: err.message } };
    }

    // log out everywhere, this browser too (better auth keeps a new session
    // for it), then clear the cookie
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await betterAuthServer.api.signOut({ headers: requestHeaders });
    await clearResetTokens(user.id);
    await clearMailThrottle("reset-password", user.id);
    recordAccountEvent("password_changed", user.id);

    if (realEmail(user)) {
      await trySend("password changed notice", () =>
        sendPasswordChangedNotice(user),
      );
    }

    redirect("/login?message=PasswordChangeSuccess");
  },
);
