import nodemailer from "nodemailer";

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

export const sendMail = async ({ to, subject, text }) =>
  getTransport().sendMail({ from: fromAddress(), to, subject, text });

// absolute link to a page on this site, for use in emails
export const appUrl = (path) => {
  const base = requireEnv("APP_URL").replace(/\/+$/, "");

  return `${base}${path}`;
};

// for tests
export const resetTransport = () => {
  transport = null;
};
