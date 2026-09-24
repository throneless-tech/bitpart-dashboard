import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  readBotBitpart: vi.fn(),
  linkChannelBitpart: vi.fn(),
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
}));

import { getBotStatus, relinkBot } from "./linkBot";
import { signalChannelStatus } from "@/app/_lib/bitpart";

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
