import { appUrl, countEmail, sendMail } from "@/app/_lib/mail";
import { claimMailSlot, clearResetTokens } from "@/app/_lib/mailThrottle";
import { prisma } from "@/lib/prisma";
import { realEmail } from "@/app/_lib/placeholderEmail";

// send a confirmation link from better auth. user.email is the address being
// confirmed (the new one for an email change). returns false if throttled or
// there is no real address.
export const sendVerificationEmail = async ({ user, token }) => {
  const to = realEmail(user);

  if (!to) {
    countEmail("verify", "skipped");
    return false;
  }

  if (!(await claimMailSlot("verify-email", user.id))) {
    countEmail("verify", "throttled");
    return false;
  }

  await sendMail({
    kind: "verify",
    to,
    subject: "Confirm your Bitpart email address",
    text: `Hi ${user.username},

Please confirm this email address for your Bitpart account by opening the link below. The link expires in 24 hours.

${appUrl(`/verify-email?token=${token}`)}

If you didn't ask for this, you can ignore this email.`,
  });

  return true;
};

// send a reset link from better auth. only the latest link works: older ones
// are removed, and a throttled request's token is dropped. returns false if
// throttled or there is no real address.
export const sendPasswordResetEmail = async ({ user, token }) => {
  const to = realEmail(user);

  const outcome = !to
    ? "skipped"
    : !(await claimMailSlot("reset-password", user.id))
      ? "throttled"
      : null;

  if (outcome) {
    countEmail("reset", outcome);
    await prisma.verification.deleteMany({
      where: { identifier: `reset-password:${token}` },
    });
    return false;
  }

  await clearResetTokens(user.id, token);

  await sendMail({
    kind: "reset",
    to,
    subject: "Reset your Bitpart password",
    text: `Hi ${user.username},

Someone asked to reset the password for your Bitpart account. To choose a new password, open the link below. The link expires in 1 hour.

${appUrl(`/reset-password?token=${token}`)}

If you didn't ask for this, you can ignore this email. Your password won't change.`,
  });

  return true;
};

// how long an email sign-in code works, in minutes
export const EMAIL_CODE_MINUTES = 5;

// a sign-in code for email two-factor; callers check the address is real
// and confirmed
export const sendTwoFactorCode = async ({ user, code }) =>
  sendMail({
    kind: "sign_in_code",
    to: realEmail(user),
    subject: "Your Bitpart sign-in code",
    text: `Hi ${user.username},

Your Bitpart sign-in code is ${code}. It expires in ${EMAIL_CODE_MINUTES} minutes.

If you didn't just try to log in, someone else may know your password. Change it from your settings page.`,
  });

export const sendEmailChangedNotice = async ({
  username,
  oldEmail,
  newEmail,
}) =>
  sendMail({
    kind: "email_changed",
    to: oldEmail,
    subject: "Your Bitpart email address was changed",
    text: `Hi ${username},

The email address on your Bitpart account was changed to ${newEmail}. This address will no longer be used for your account.

If you didn't make this change, please contact us at contact@bitp.art.`,
  });

const alertFooter = () =>
  `You're getting this because bot problem emails are turned on for your Bitpart account. You can turn them off on your settings page:\n\n${appUrl("/settings")}`;

const botAlertBodies = {
  unlinked: ({ bot }) => ({
    subject: `Your Bitpart bot "${bot.botName}" is no longer linked to Signal`,
    text: `Your bot "${bot.botName}" has stopped being linked to its Signal account, so it can't send or receive messages.

To fix this, open My Bots and choose "Re-link this bot" on the bot's card, then scan the QR code with Signal:

${appUrl("/my-bots")}`,
  }),
  failed: ({ bot }) => ({
    subject: `Your Bitpart bot "${bot.botName}" couldn't send a message`,
    text: `Your bot "${bot.botName}" failed the last time it tried to send a message on Signal.

If this keeps happening, check the bot's status on My Bots, and try re-linking it:

${appUrl("/my-bots")}`,
  }),
  challenge_required: ({ bot }) => ({
    subject: `Your Bitpart bot "${bot.botName}" needs a captcha solved`,
    text: `Signal is asking your bot "${bot.botName}" to solve a captcha before it can send more messages. Until it's solved, the bot can't send messages.

Open the link below for instructions:

${appUrl(`/my-bots/challenge/${bot.id}`)}`,
  }),
  rate_limited: ({ bot, retryAt }) => ({
    subject: `Your Bitpart bot "${bot.botName}" is being rate limited by Signal`,
    text: `Signal is temporarily limiting how many messages your bot "${bot.botName}" can send.${
      retryAt ? ` The bot will try again after ${retryAt.toUTCString()}.` : ""
    }

You don't need to do anything; this usually clears up by itself. If it keeps happening, the bot may be sending too many messages too quickly.`,
  }),
};

export const BOT_ALERT_KINDS = Object.keys(botAlertBodies);

export const sendBotAlert = async ({ user, bot, kind, retryAt }) => {
  const { subject, text } = botAlertBodies[kind]({ bot, retryAt });

  return sendMail({
    kind: "bot_alert",
    to: realEmail(user),
    subject,
    text: `Hi ${user.username},\n\n${text}\n\n${alertFooter()}`,
  });
};

export const sendPasswordChangedNotice = async (user) =>
  sendMail({
    kind: "password_changed",
    to: realEmail(user),
    subject: "Your Bitpart password was changed",
    text: `Hi ${user.username},

The password for your Bitpart account was just changed, and you've been logged out everywhere.

If you didn't make this change, reset your password straight away from the login page, or contact us at contact@bitp.art.`,
  });
