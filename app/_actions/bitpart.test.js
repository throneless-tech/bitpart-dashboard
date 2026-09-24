import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = await vi.hoisted(async () => {
  const { EventEmitter } = await import("node:events");

  const sockets = [];

  class FakeWebSocket extends EventEmitter {
    OPEN = 1;

    constructor(url, options) {
      super();
      this.url = url;
      this.options = options;
      this.sent = [];
      this.readyState = mocks.fail ? 3 : 1;
      sockets.push(this);
      setTimeout(() => {
        try {
          this.emit(mocks.fail ? "error" : "open", new Error("refused"));
        } catch {
          // the error listener rethrows after rejecting; swallow it here
        }
      });
    }

    send(json) {
      this.sent.push(JSON.parse(json));
      setTimeout(() => this.emit("message", JSON.stringify(mocks.reply)));
    }
  }

  return {
    FakeWebSocket,
    sockets,
    fail: false,
    reply: { message_type: "Ok" },
    getUser: vi.fn(),
    findFirst: vi.fn(),
    transaction: vi.fn(),
    deleteFromEMS: vi.fn(),
  };
});

vi.mock("ws", () => ({ default: mocks.FakeWebSocket }));
vi.mock("./formatBot", () => ({ formatCsml: vi.fn(async () => "CSML") }));
vi.mock("./getUser", () => ({ getUser: mocks.getUser }));
vi.mock("./ems", () => ({ deleteFromEMS: mocks.deleteFromEMS }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    bot: { findFirst: mocks.findFirst },
    $transaction: mocks.transaction,
  },
}));

import { createBotBitpart, linkChannelBitpart } from "./createBot";
import { updateBotBitpart } from "./updateBot";
import { deleteBot } from "./deleteBot";

beforeEach(() => {
  vi.stubEnv("BITPART_SERVER_TOKEN", "token");
  vi.stubEnv("EMS_SERVER_HOST", "ems:3005");
  mocks.fail = false;
  mocks.reply = { message_type: "Ok" };
  mocks.sockets.length = 0;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const lastSocket = () => mocks.sockets[mocks.sockets.length - 1];

describe("createBotBitpart", () => {
  it("sends a CreateBot message to the host with the auth header", async () => {
    const result = await createBotBitpart(
      { botName: "Acme" },
      "bot-1",
      "PC",
      "bp:5000",
    );

    const socket = lastSocket();
    expect(socket.url).toBe("ws://bp:5000/ws");
    expect(socket.options.headers.Authorization).toBe("token");
    expect(socket.sent).toEqual([
      {
        message_type: "CreateBot",
        data: {
          id: "bot-1",
          name: "Acme",
          apps_endpoint: "http://ems:3005/ems",
          flows: [
            {
              id: "Default",
              name: "Default",
              content: "CSML",
              commands: [],
            },
          ],
          default_flow: "Default",
        },
      },
    ]);
    expect(result).toEqual({ message_type: "Ok" });
  });

  it("throws when EMS_SERVER_HOST is not configured", async () => {
    vi.stubEnv("EMS_SERVER_HOST", "");

    await expect(
      createBotBitpart({ botName: "Acme" }, "bot-1", "PC", "bp:5000"),
    ).rejects.toThrow("EMS_SERVER_HOST is not configured.");
  });

  it("throws when BITPART_SERVER_TOKEN is not configured", async () => {
    delete process.env.BITPART_SERVER_TOKEN;

    await expect(
      createBotBitpart({ botName: "Acme" }, "bot-1", "PC", "bp:5000"),
    ).rejects.toThrow("BITPART_SERVER_TOKEN is not configured.");
  });

  it("rejects with a connection error when the socket fails", async () => {
    mocks.fail = true;

    await expect(
      createBotBitpart({ botName: "Acme" }, "bot-1", "PC", "bp:5000"),
    ).rejects.toThrow(/Web socket connection was refused/);
  });
});

describe("linkChannelBitpart", () => {
  it("sends a LinkChannel message for the signal channel", async () => {
    await linkChannelBitpart("bot-1", "bp:5000");

    expect(lastSocket().url).toBe("ws://bp:5000/ws");
    expect(lastSocket().sent).toEqual([
      {
        message_type: "LinkChannel",
        data: { id: "signal", bot_id: "bot-1", device_name: "bitpart" },
      },
    ]);
  });
});

describe("updateBotBitpart", () => {
  it("re-sends the bot definition as a CreateBot message", async () => {
    await updateBotBitpart({ botName: "Acme" }, "bot-1", "PC", "bp:5000");

    const [message] = lastSocket().sent;
    expect(message.message_type).toBe("CreateBot");
    expect(message.data.id).toBe("bot-1");
    expect(message.data.apps_endpoint).toBe("http://ems:3005/ems");
  });

  it("throws when EMS_SERVER_HOST is not configured", async () => {
    vi.stubEnv("EMS_SERVER_HOST", "");

    await expect(
      updateBotBitpart({ botName: "Acme" }, "bot-1", "PC", "bp:5000"),
    ).rejects.toThrow("EMS_SERVER_HOST is not configured.");
  });
});

describe("deleteBot", () => {
  beforeEach(() => {
    mocks.getUser.mockResolvedValue({ id: "user-1" });
    mocks.findFirst.mockResolvedValue({
      id: "row-1",
      bitpartId: "bot-1",
      instance: "bp:5000",
      botType: "esim",
    });
    mocks.transaction.mockResolvedValue(undefined);
  });

  it("deletes using the owned row's fields, not the client's", async () => {
    await deleteBot("row-1", "someone-elses-bot", "alice", "evil:1");

    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: "row-1", creatorId: "user-1" },
    });
    expect(lastSocket().url).toBe("ws://bp:5000/ws");
    expect(lastSocket().sent).toEqual([
      { message_type: "DeleteBot", data: { id: "bot-1" } },
    ]);
    expect(mocks.deleteFromEMS).toHaveBeenCalledWith("bot-1", "esim");
  });

  it("does not contact bitpart when the bot is not owned", async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(
      deleteBot("row-1", "bot-1", "alice", "bp:5000"),
    ).rejects.toThrow("Bot not found.");
    expect(mocks.sockets).toHaveLength(0);
  });

  it("throws when BITPART_SERVER_TOKEN is not configured", async () => {
    delete process.env.BITPART_SERVER_TOKEN;

    await expect(
      deleteBot("row-1", "bot-1", "alice", "bp:5000"),
    ).rejects.toThrow("BITPART_SERVER_TOKEN is not configured.");
  });
});
