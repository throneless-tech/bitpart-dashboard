"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "./getUser";
import { consumeToken, clearTokens } from "@/app/_lib/tokens";
import {
  sendEmailChangedNotice,
  sendPasswordChangedNotice,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/app/_lib/accountEmails";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_LENGTH_MESSAGE,
} from "@/app/_lib/definitions";

const RESET_REQUESTED_MESSAGE =
  "If an account with an email address matches, we've sent it a link to reset the password. The link expires in 1 hour.";

const normalizeEmail = (value) => value?.trim() || null;

// emails are stored as typed, so match them case-insensitively
const emailIs = (email) => ({ equals: email, mode: "insensitive" });

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
    console.error(`Failed to send ${label} email`, error);
    return false;
  }
};

// the logged in user, checked against their current password
const getVerifiedUser = async (username, currentPassword) => {
  const user = await getUser(username);

  if (!user) {
    return { error: { general: "You must be logged in to do this." } };
  }

  if (
    !currentPassword ||
    !(await bcrypt.compare(currentPassword, user.password))
  ) {
    return {
      error: { currentPassword: "Your current password is incorrect." },
    };
  }

  return { user };
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
    email: user.email,
    emailVerified: !!user.emailVerified,
    pendingEmail: user.pendingEmail,
    notifyBotIssues: user.notifyBotIssues,
  };
};

export const setBotIssueNotifications = async (username, enabled) => {
  const user = await getUser(username);

  if (!user) {
    return { error: "You must be logged in to do this." };
  }

  if (enabled && !user.email) {
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
};

// forgot password: always gives the same answer, so it can't be used to find
// out which accounts exist
export const requestPasswordReset = async (prevState, formData) => {
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
  if (user?.email) {
    await trySend("password reset", () => sendPasswordResetEmail(user));
  }

  return { success: RESET_REQUESTED_MESSAGE };
};

export const resetPassword = async (prevState, formData) => {
  const password = formData.get("password");
  const invalid = checkNewPassword(password, formData.get("passwordConfirm"));

  if (invalid) {
    return { error: { password: invalid } };
  }

  const userId = await consumeToken("reset-password", formData.get("token"));

  if (!userId) {
    return {
      error: {
        general:
          "This reset link is invalid or has expired. Please request a new one.",
      },
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: await bcrypt.hash(password, 10),
      sessionVersion: { increment: 1 },
    },
  });

  redirect("/login?message=PasswordResetSuccess");
};

export const verifyEmail = async (token) => {
  const userId = await consumeToken("verify-email", token);

  if (!userId) {
    return { error: "This confirmation link is invalid or has expired." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { error: "This confirmation link is invalid or has expired." };
  }

  if (user.pendingEmail) {
    const oldEmail = user.email;
    const newEmail = user.pendingEmail;

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: newEmail,
          pendingEmail: null,
          emailVerified: new Date(),
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        return {
          error:
            "This email address is now used by another account. Please choose a different one.",
        };
      }
      throw error;
    }

    if (oldEmail) {
      await trySend("email changed notice", () =>
        sendEmailChangedNotice({
          username: user.username,
          oldEmail,
          newEmail,
        }),
      );
    }

    return { email: newEmail };
  }

  if (!user.email) {
    return { error: "This confirmation link is invalid or has expired." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  return { email: user.email };
};

export const resendVerificationEmail = async (username) => {
  const user = await getUser(username);

  if (!user) {
    return { error: "You must be logged in to do this." };
  }

  const sent = await trySend("confirmation", () => sendVerificationEmail(user));

  return sent
    ? { success: "Confirmation email sent. Check your inbox." }
    : {
        error:
          "We couldn't send a confirmation email right now. If you just requested one, wait a couple of minutes and try again.",
      };
};

export const changeEmail = async (prevState, formData) => {
  const { user, error } = await getVerifiedUser(
    formData.get("username"),
    formData.get("currentPassword"),
  );

  if (error) {
    return { error };
  }

  const email = normalizeEmail(formData.get("email"));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: { email: "Enter a valid email address." } };
  }

  if (email.toLowerCase() === user.email?.toLowerCase()) {
    return { error: { email: "This is already your email address." } };
  }

  if (await emailInUse(email, user.id)) {
    return { error: { email: "This email address is already in use." } };
  }

  // with no current address, use the new one straight away (unconfirmed).
  // otherwise keep the old one until the new one is confirmed.
  const data = user.email
    ? { pendingEmail: email }
    : { email, emailVerified: null, pendingEmail: null };

  try {
    await prisma.user.update({ where: { id: user.id }, data });
  } catch (err) {
    if (err.code === "P2002") {
      return { error: { email: "This email address is already in use." } };
    }
    throw err;
  }

  await clearTokens("verify-email", user.id);
  const sent = await trySend("confirmation", () =>
    sendVerificationEmail({ ...user, ...data }),
  );

  return {
    success: sent
      ? `We've sent a confirmation link to ${email}.`
      : `Saved, but we couldn't send a confirmation link to ${email}. Try "Resend confirmation email" in a few minutes.`,
  };
};

export const cancelEmailChange = async (username) => {
  const user = await getUser(username);

  if (!user) {
    return { error: "You must be logged in to do this." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { pendingEmail: null },
  });
  await clearTokens("verify-email", user.id);

  return { success: "Email change cancelled." };
};

export const removeEmail = async (prevState, formData) => {
  const { user, error } = await getVerifiedUser(
    formData.get("username"),
    formData.get("currentPassword"),
  );

  if (error) {
    return { error };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: null, emailVerified: null, pendingEmail: null },
  });
  await clearTokens("verify-email", user.id);
  await clearTokens("reset-password", user.id);

  return { success: "Your email address has been removed." };
};

export const changePassword = async (prevState, formData) => {
  const { user, error } = await getVerifiedUser(
    formData.get("username"),
    formData.get("currentPassword"),
  );

  if (error) {
    return { error };
  }

  const password = formData.get("password");
  const invalid = checkNewPassword(password, formData.get("passwordConfirm"));

  if (invalid) {
    return { error: { password: invalid } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(password, 10),
      sessionVersion: { increment: 1 },
    },
  });
  await clearTokens("reset-password", user.id);

  if (user.email) {
    await trySend("password changed notice", () =>
      sendPasswordChangedNotice(user),
    );
  }

  redirect("/login?message=PasswordChangeSuccess");
};
