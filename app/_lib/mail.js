import nodemailer from "nodemailer";
import { count, withSpan } from "@/app/_lib/otel";
import { errorFields, logger } from "@/app/_lib/logger";

let transport = null;

const requireEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`${name} is not configured.`);
  }

  return process.env[name];
};

const getTransport = () => {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 587;

    transport = nodemailer.createTransport({
      host: requireEnv("SMTP_HOST"),
      port,
      // SMTPS (implicit TLS) when set, otherwise STARTTLS if the server offers it
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }

  return transport;
};

const fromAddress = () => {
  const from = requireEnv("MAIL_FROM").trim();

  return from.includes("<") ? from : { name: "Bitpart", address: from };
};

// emails not sent at all (throttled, or no real address)
export const countEmail = (kind, outcome) =>
  count("dashboard.emails", { kind, outcome });

// kind says what the email is for (verify, reset, bot_alert, ...); it, not
// the address, is what gets traced and logged
export const sendMail = async ({ kind = "other", to, subject, text }) =>
  withSpan("mail.send", { kind }, async (span) => {
    try {
      const result = await getTransport().sendMail({
        from: fromAddress(),
        to,
        subject,
        text,
      });

      span.setAttribute("outcome", "sent");
      countEmail(kind, "sent");
      logger.info({ kind }, "email sent");

      return result;
    } catch (error) {
      span.setAttribute("outcome", "failed");
      countEmail(kind, "failed");
      logger.error({ kind, ...errorFields(error) }, "email not sent");
      throw error;
    }
  });

// absolute link to a page on this site, for use in emails
export const appUrl = (path) => {
  const base = requireEnv("APP_URL").replace(/\/+$/, "");

  return `${base}${path}`;
};

// for tests
export const resetTransport = () => {
  transport = null;
};
