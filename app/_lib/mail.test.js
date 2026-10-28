import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: { createTransport: mocks.createTransport },
}));

import { appUrl, resetTransport, sendMail } from "./mail";

beforeEach(() => {
  mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail });
  vi.stubEnv("SMTP_HOST", "smtp.example.org");
  vi.stubEnv("SMTP_PORT", "587");
  vi.stubEnv("SMTP_SECURE", "");
  vi.stubEnv("SMTP_USER", "mailer");
  vi.stubEnv("SMTP_PASSWORD", "secret");
  vi.stubEnv("MAIL_FROM", "no-reply@bitp.art");
  vi.stubEnv("APP_URL", "https://dashboard.bitp.art/");
  resetTransport();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("sendMail", () => {
  it("sends from MAIL_FROM through the configured SMTP server", async () => {
    await sendMail({ to: "a@b.org", subject: "Hi", text: "Body" });

    expect(mocks.createTransport).toHaveBeenCalledWith({
      host: "smtp.example.org",
      port: 587,
      secure: false,
      auth: { user: "mailer", pass: "secret" },
    });
    expect(mocks.sendMail).toHaveBeenCalledWith({
      from: "no-reply@bitp.art",
      to: "a@b.org",
      subject: "Hi",
      text: "Body",
    });
  });

  it("uses SMTPS when SMTP_SECURE is true", async () => {
    vi.stubEnv("SMTP_SECURE", "true");

    await sendMail({ to: "a@b.org", subject: "Hi", text: "Body" });

    expect(mocks.createTransport.mock.calls[0][0].secure).toBe(true);
  });

  it("defaults to SMTPS on port 465 when SMTP_SECURE is unset", async () => {
    vi.stubEnv("SMTP_PORT", "465");

    await sendMail({ to: "a@b.org", subject: "Hi", text: "Body" });

    expect(mocks.createTransport.mock.calls[0][0].secure).toBe(true);
  });

  it("connects without auth when no SMTP user is set", async () => {
    vi.stubEnv("SMTP_USER", "");

    await sendMail({ to: "a@b.org", subject: "Hi", text: "Body" });

    expect(mocks.createTransport.mock.calls[0][0].auth).toBeUndefined();
  });

  it("throws when SMTP_HOST is not configured", async () => {
    vi.stubEnv("SMTP_HOST", "");

    await expect(
      sendMail({ to: "a@b.org", subject: "Hi", text: "Body" }),
    ).rejects.toThrow("SMTP_HOST is not configured.");
  });

  it("throws when MAIL_FROM is not configured", async () => {
    vi.stubEnv("MAIL_FROM", "");

    await expect(
      sendMail({ to: "a@b.org", subject: "Hi", text: "Body" }),
    ).rejects.toThrow("MAIL_FROM is not configured.");
  });
});

describe("appUrl", () => {
  it("joins APP_URL and the path without a double slash", () => {
    expect(appUrl("/reset-password?token=abc")).toBe(
      "https://dashboard.bitp.art/reset-password?token=abc",
    );
  });

  it("throws when APP_URL is not configured", () => {
    vi.stubEnv("APP_URL", "");

    expect(() => appUrl("/x")).toThrow("APP_URL is not configured.");
  });
});
