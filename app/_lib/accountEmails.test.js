import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock("@/app/_lib/mail", () => ({
  sendMail: mocks.sendMail,
  appUrl: (path) => `https://dash.example${path}`,
}));
vi.mock("@/app/_lib/tokens", () => ({ createToken: vi.fn() }));

import { BOT_ALERT_KINDS, sendBotAlert } from "./accountEmails";

const user = { username: "alice", email: "alice@mail.org" };
const bot = { id: "row-1", botName: "Acme", challengeToken: "secret-token" };

const sent = () => mocks.sendMail.mock.calls[0][0];

beforeEach(() => {
  mocks.sendMail.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("sendBotAlert", () => {
  it("has an email for each alert kind", () => {
    expect(BOT_ALERT_KINDS.sort()).toEqual(
      ["challenge_required", "failed", "rate_limited", "unlinked"].sort(),
    );
  });

  it("links to the captcha page without including the token", async () => {
    await sendBotAlert({ user, bot, kind: "challenge_required" });

    expect(sent().to).toBe("alice@mail.org");
    expect(sent().text).toContain(
      "https://dash.example/my-bots/challenge/row-1",
    );
    expect(sent().text).not.toContain("secret-token");
  });

  it("includes the retry time for rate limits", async () => {
    await sendBotAlert({
      user,
      bot,
      kind: "rate_limited",
      retryAt: new Date("2026-10-29T15:00:00Z"),
    });

    expect(sent().text).toContain("Thu, 29 Oct 2026 15:00:00 GMT");
  });

  it("links to settings so the owner can turn alerts off", async () => {
    await sendBotAlert({ user, bot, kind: "unlinked" });

    expect(sent().text).toContain("https://dash.example/settings");
    expect(sent().subject).toContain("Acme");
  });
});
