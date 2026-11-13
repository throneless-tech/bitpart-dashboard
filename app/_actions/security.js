"use server";
import { traceAction } from "@/app/_lib/otel";
import { errorFields, logger } from "@/app/_lib/logger";
import { recordAccountEvent } from "@/app/_lib/events";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { betterAuthServer } from "@/auth";
import { getUser } from "./getUser";
import { getVerifiedUser } from "@/app/_lib/verifiedUser";
import { canUseEmailCodes } from "@/app/_lib/mfa";

// second factors and passkeys, from the settings page. see app/_lib/mfa.js
// for how totp and email codes are kept apart.

const NOT_LOGGED_IN = "You must be logged in to do this.";

const findTwoFactor = (userId) =>
  prisma.twoFactor.findUnique({ where: { userId } });

// a password from the form, already checked by getVerifiedUser
const passwordOf = (formData) => formData.get("currentPassword");

const failed = (label, error) => {
  logger.error(
    { action: label, ...errorFields(error) },
    "security change failed",
  );
  return { error: { general: `Couldn't ${label}. Please try again.` } };
};

// step 1 of setting up an authenticator app: a new secret, as a QR code and
// as text. the backup codes are shown once the app is confirmed.
export const startTotpSetup = traceAction(
  "action.startTotpSetup",
  async (prevState, formData) => {
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      passwordOf(formData),
    );

    if (error) {
      return { error };
    }

    const existing = await findTwoFactor(user.id);

    if (existing?.verified) {
      return { error: { general: "An authenticator app is already set up." } };
    }

    let result;

    try {
      result = await betterAuthServer.api.enableTwoFactor({
        body: { password: passwordOf(formData), method: "totp" },
        headers: await headers(),
      });
    } catch (err) {
      return failed("set up the authenticator app", err);
    }

    let backupCodes = result.backupCodes;

    // with email codes on, keep the backup codes the user already has
    if (existing && user.emailOtpEnabled) {
      await prisma.twoFactor.update({
        where: { userId: user.id },
        data: { backupCodes: existing.backupCodes },
      });
      backupCodes = null;
    }

    return {
      totp: {
        qr: await QRCode.toDataURL(result.totpURI),
        secret: new URL(result.totpURI).searchParams.get("secret"),
      },
      backupCodes,
    };
  },
);

// step 2: a code from the app turns it on
export const confirmTotpSetup = traceAction(
  "action.confirmTotpSetup",
  async (prevState, formData) => {
    const user = await getUser(formData.get("username"));

    if (!user) {
      return { error: { general: NOT_LOGGED_IN } };
    }

    try {
      await betterAuthServer.api.verifyTOTP({
        body: { code: formData.get("code")?.trim() ?? "" },
        headers: await headers(),
      });
    } catch {
      return {
        error: {
          code: "That code didn't work. Check the time on your phone is right, and try the newest code.",
        },
      };
    }

    recordAccountEvent("totp_enabled", user.id);
    return { success: "Your authenticator app is on." };
  },
);

export const disableTotp = traceAction(
  "action.disableTotp",
  async (prevState, formData) => {
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      passwordOf(formData),
    );

    if (error) {
      return { error };
    }

    if (!(await findTwoFactor(user.id))?.verified) {
      return { error: { general: "No authenticator app is set up." } };
    }

    if (user.emailOtpEnabled) {
      // email codes stay on: keep the row (and backup codes) without the secret
      await prisma.twoFactor.update({
        where: { userId: user.id },
        data: { verified: false, secret: "disabled" },
      });
    } else {
      try {
        await betterAuthServer.api.disableTwoFactor({
          body: { password: passwordOf(formData) },
          headers: await headers(),
        });
      } catch (err) {
        return failed("turn off the authenticator app", err);
      }
    }

    recordAccountEvent("totp_disabled", user.id);
    return { success: "Your authenticator app is off." };
  },
);

export const enableEmailCodes = traceAction(
  "action.enableEmailCodes",
  async (prevState, formData) => {
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      passwordOf(formData),
    );

    if (error) {
      return { error };
    }

    if (!canUseEmailCodes(user)) {
      return {
        error: {
          general:
            "Add and confirm an email address before turning on email sign-in codes.",
        },
      };
    }

    if (user.emailOtpEnabled) {
      return { success: "Email sign-in codes are already on." };
    }

    const existing = await findTwoFactor(user.id);
    let backupCodes = null;

    // backup codes come with the first second factor. better auth makes them
    // when it starts an authenticator app setup; that row isn't verified, so
    // it doesn't turn on the app.
    if (!existing?.verified) {
      try {
        ({ backupCodes } = await betterAuthServer.api.enableTwoFactor({
          body: { password: passwordOf(formData), method: "totp" },
          headers: await headers(),
        }));
      } catch (err) {
        return failed("turn on email sign-in codes", err);
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailOtpEnabled: true, twoFactorEnabled: true },
    });

    recordAccountEvent("email_codes_enabled", user.id);
    return { success: "Email sign-in codes are on.", backupCodes };
  },
);

export const disableEmailCodes = traceAction(
  "action.disableEmailCodes",
  async (prevState, formData) => {
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      passwordOf(formData),
    );

    if (error) {
      return { error };
    }

    if (!user.emailOtpEnabled) {
      return { success: "Email sign-in codes are already off." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailOtpEnabled: false },
    });

    // nothing else left: turn two-factor off (and remove the backup codes)
    if (!(await findTwoFactor(user.id))?.verified) {
      try {
        await betterAuthServer.api.disableTwoFactor({
          body: { password: passwordOf(formData) },
          headers: await headers(),
        });
      } catch (err) {
        return failed("turn off email sign-in codes", err);
      }
    }

    recordAccountEvent("email_codes_disabled", user.id);
    return { success: "Email sign-in codes are off." };
  },
);

export const regenerateBackupCodes = traceAction(
  "action.regenerateBackupCodes",
  async (prevState, formData) => {
    const { user, error } = await getVerifiedUser(
      formData.get("username"),
      passwordOf(formData),
    );

    if (error) {
      return { error };
    }

    if (!(await findTwoFactor(user.id)) || !user.twoFactorEnabled) {
      return {
        error: {
          general:
            "Turn on an authenticator app or email codes to get backup codes.",
        },
      };
    }

    try {
      const { backupCodes } = await betterAuthServer.api.generateBackupCodes({
        body: { password: passwordOf(formData) },
        headers: await headers(),
      });

      recordAccountEvent("backup_codes_regenerated", user.id);
      return {
        success: "New backup codes made. Your old ones no longer work.",
        backupCodes,
      };
    } catch (err) {
      return failed("make new backup codes", err);
    }
  },
);

// better auth checks the passkey belongs to the logged in user
export const renamePasskey = traceAction(
  "action.renamePasskey",
  async (prevState, formData) => {
    const user = await getUser(formData.get("username"));
    const name = formData.get("name")?.trim();

    if (!user) {
      return { error: { general: NOT_LOGGED_IN } };
    }

    if (!name) {
      return { error: { name: "Enter a name." } };
    }

    try {
      await betterAuthServer.api.updatePasskey({
        body: { id: formData.get("id"), name: name.slice(0, 100) },
        headers: await headers(),
      });
    } catch {
      return { error: { general: "Couldn't rename that passkey." } };
    }

    return { success: "Passkey renamed." };
  },
);

export const deletePasskey = traceAction(
  "action.deletePasskey",
  async (username, id) => {
    const user = await getUser(username);

    if (!user) {
      return { error: NOT_LOGGED_IN };
    }

    try {
      await betterAuthServer.api.deletePasskey({
        body: { id },
        headers: await headers(),
      });
    } catch {
      return { error: "Couldn't remove that passkey." };
    }

    recordAccountEvent("passkey_removed", user.id);
    return { success: "Passkey removed." };
  },
);
