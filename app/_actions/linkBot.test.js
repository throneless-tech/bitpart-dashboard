import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  readBotBitpart: vi.fn(),
  linkChannelBitpart: vi.fn(),
  submitChallengeBitpart: vi.fn(),
}));

vi.mock("./getUser", () => ({ getUser: mocks.getUser }));
vi.mock("./createBot", () => ({
  linkChannelBitpart: mocks.linkChannelBitpart,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    bot: { findFirst: mocks.findFirst, update: mocks.update },
  },
}));
vi.mock("@/app/_lib/bitpart", async (importOriginal) => ({
  ...(await importOriginal()),
  readBotBitpart: mocks.readBotBitpart,
  submitChallengeBitpart: mocks.submitChallengeBitpart,
}));

import {
  getBotChallenge,
  getBotStatus,
  relinkBot,
  submitBotChallenge,
} from "./linkBot";
import { signalChannelHealth, signalChannelStatus } from "@/app/_lib/bitpart";

const readBotResponse = (channels) => ({
  message_type: "Response",
  data: {
    response_type: "ReadBot",
    response: { bot: { id: "bot-1" }, expire_timer: 0, channels },
  },
});

const ownedBot = {
  id: "row-1",
  bitpartId: "bot-1",
  instance: "bp:5000",
  botName: "Acme",
  expireTimer: 604800,
  creatorId: "user-1",
};

beforeEach(() => {
  mocks.getUser.mockResolvedValue({ id: "user-1" });
  mocks.findFirst.mockResolvedValue(ownedBot);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("signalChannelStatus", () => {
  it("reads the signal channel, not the first channel", () => {
    expect(
      signalChannelStatus(
        readBotResponse([
          { channel_id: "backup", status: "failing" },
          { channel_id: "signal", status: "linked" },
        ]),
      ),
    ).toBe("linked");
  });

  it("passes through linked, unlinked and failing", () => {
    ["linked", "unlinked", "failing"].forEach((status) => {
      expect(
        signalChannelStatus(
          readBotResponse([{ channel_id: "signal", status }]),
        ),
      ).toBe(status);
    });
  });

  it("treats an unknown status as failing", () => {
    expect(
      signalChannelStatus(
        readBotResponse([{ channel_id: "signal", status: "weird" }]),
      ),
    ).toBe("failing");
  });

  it("treats a missing signal channel as unlinked", () => {
    expect(signalChannelStatus(readBotResponse([]))).toBe("unlinked");
  });

  it("treats an error or malformed response as unknown", () => {
    expect(
      signalChannelStatus({ message_type: "Error", data: { response: "x" } }),
    ).toBe("unknown");
    expect(signalChannelStatus(undefined)).toBe("unknown");
    expect(signalChannelStatus({ message_type: "Response", data: {} })).toBe(
      "unknown",
    );
  });
});

describe("signalChannelHealth", () => {
  const health = (channel) =>
    signalChannelHealth(
      readBotResponse([{ channel_id: "signal", status: "linked", ...channel }]),
    );

  it("reads an ok send status", () => {
    expect(health({ send_status: "ok" })).toEqual({
      status: "linked",
      sendStatus: "ok",
      challengeToken: null,
      retryAt: null,
    });
  });

  it("includes the challenge token when a captcha is required", () => {
    expect(
      health({ send_status: "challenge_required", challenge_token: "tok-1" }),
    ).toMatchObject({
      sendStatus: "challenge_required",
      challengeToken: "tok-1",
    });
  });

  it("parses retry_at when rate limited", () => {
    const result = health({
      send_status: "rate_limited",
      retry_at: "2026-10-29T15:30:00Z",
    });

    expect(result.sendStatus).toBe("rate_limited");
    expect(result.retryAt.toISOString()).toBe("2026-10-29T15:30:00.000Z");
  });

  it("ignores extra fields that don't belong to the send status", () => {
    expect(
      health({ send_status: "failed", challenge_token: "x", retry_at: "y" }),
    ).toMatchObject({
      sendStatus: "failed",
      challengeToken: null,
      retryAt: null,
    });
  });

  it("returns a null send status when it's missing or unrecognised", () => {
    expect(health({}).sendStatus).toBeNull();
    expect(health({ send_status: "weird" }).sendStatus).toBeNull();
    expect(signalChannelHealth(undefined)).toMatchObject({
      status: "unknown",
      sendStatus: null,
    });
  });
});

describe("getBotStatus", () => {
  it("reads the owned bot using its stored id and host", async () => {
    mocks.readBotBitpart.mockResolvedValue(
      readBotResponse([{ channel_id: "signal", status: "linked" }]),
    );

    expect(await getBotStatus("row-1", "alice")).toBe("linked");
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: "row-1", creatorId: "user-1" },
    });
    expect(mocks.readBotBitpart).toHaveBeenCalledWith("bot-1", "bp:5000");
  });

  it("returns unknown when the ReadBot call itself fails", async () => {
    mocks.readBotBitpart.mockRejectedValue(new Error("refused"));

    expect(await getBotStatus("row-1", "alice")).toBe("unknown");
  });

  it("refuses bots the user doesn't own, without contacting bitpart", async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(getBotStatus("row-1", "alice")).rejects.toThrow(
      "Bot not found.",
    );
    expect(mocks.readBotBitpart).not.toHaveBeenCalled();
  });

  it("refuses when the user isn't logged in as that username", async () => {
    mocks.getUser.mockResolvedValue(null);

    await expect(getBotStatus("row-1", "alice")).rejects.toThrow(
      "Not authorized to access this bot.",
    );
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});

describe("relinkBot", () => {
  it("sends LinkChannel with the stored name and timer and saves the new link", async () => {
    mocks.linkChannelBitpart.mockResolvedValue({
      message_type: "Response",
      data: { response: "sgnl://linkdevice?uuid=abc" },
    });

    const result = await relinkBot("row-1", "alice");

    expect(mocks.linkChannelBitpart).toHaveBeenCalledWith(
      "bot-1",
      "bp:5000",
      "Acme",
      604800,
    );
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "row-1", creatorId: "user-1" },
      data: { qrLink: "sgnl://linkdevice?uuid=abc" },
    });
    expect(result).toEqual({ qr: "sgnl://linkdevice?uuid=abc" });
  });

  it("throws and saves nothing when bitpart returns an error", async () => {
    mocks.linkChannelBitpart.mockResolvedValue({
      message_type: "Error",
      data: { response: "no such bot" },
    });

    await expect(relinkBot("row-1", "alice")).rejects.toThrow("no such bot");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("refuses bots the user doesn't own, without contacting bitpart", async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(relinkBot("row-1", "alice")).rejects.toThrow("Bot not found.");
    expect(mocks.linkChannelBitpart).not.toHaveBeenCalled();
  });
});

describe("getBotChallenge", () => {
  it("reports a challenge from a live ReadBot", async () => {
    mocks.readBotBitpart.mockResolvedValue(
      readBotResponse([
        {
          channel_id: "signal",
          status: "linked",
          send_status: "challenge_required",
          challenge_token: "tok",
        },
      ]),
    );

    expect(await getBotChallenge("row-1", "alice")).toEqual({
      botName: "Acme",
      required: true,
      reachable: true,
    });
  });

  it("falls back to the last status the poller saw if bitpart is down", async () => {
    mocks.findFirst.mockResolvedValue({
      ...ownedBot,
      lastSendStatus: "challenge_required",
    });
    mocks.readBotBitpart.mockRejectedValue(new Error("refused"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await getBotChallenge("row-1", "alice")).toMatchObject({
      required: true,
      reachable: false,
    });
  });

  it("refuses bots the user doesn't own", async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(getBotChallenge("row-1", "alice")).rejects.toThrow(
      "Bot not found.",
    );
  });
});

describe("submitBotChallenge", () => {
  const submit = (captcha) => {
    const formData = new FormData();
    formData.set("botId", "row-1");
    formData.set("username", "alice");
    formData.set("captcha", captcha);
    return submitBotChallenge(undefined, formData);
  };

  it("sends the captcha for the owned bot and clears the stored token", async () => {
    mocks.submitChallengeBitpart.mockResolvedValue({
      message_type: "Response",
    });

    const result = await submit("  signalcaptcha://signal-hcaptcha.abc  ");

    expect(result.success).toMatch(/submitted/);
    expect(mocks.submitChallengeBitpart).toHaveBeenCalledWith("bp:5000", {
      botId: "bot-1",
      captcha: "signalcaptcha://signal-hcaptcha.abc",
    });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "row-1", creatorId: "user-1" },
      data: { challengeToken: null },
    });
  });

  it("rejects input that isn't a signalcaptcha:// link", async () => {
    const result = await submit("https://signalcaptchas.org/whatever");

    expect(result.error).toMatch(/signalcaptcha:\/\//);
    expect(mocks.submitChallengeBitpart).not.toHaveBeenCalled();
  });

  it("refuses bots the user doesn't own, without contacting bitpart", async () => {
    mocks.findFirst.mockResolvedValue(null);

    expect((await submit("signalcaptcha://abc")).error).toBe("Bot not found.");
    expect(mocks.submitChallengeBitpart).not.toHaveBeenCalled();
  });

  it("reports when Signal rejects the captcha", async () => {
    mocks.submitChallengeBitpart.mockResolvedValue({
      message_type: "Error",
      data: { response: "captcha expired" },
    });

    const result = await submit("signalcaptcha://abc");

    expect(result.error).toMatch(/captcha expired/);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
