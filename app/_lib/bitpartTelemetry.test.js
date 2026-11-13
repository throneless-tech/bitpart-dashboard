import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SpanKind } from "@opentelemetry/api";
import { setUpTestTelemetry } from "./otel.testing";

const mocks = await vi.hoisted(async () => {
  const { EventEmitter } = await import("node:events");
  const sockets = [];

  class FakeWebSocket extends EventEmitter {
    OPEN = 1;

    constructor(url, options) {
      super();
      this.url = url;
      this.options = options;
      this.readyState = mocks.fail ? 3 : 1;
      sockets.push(this);
      setTimeout(() =>
        this.emit(mocks.fail ? "error" : "open", new Error("refused")),
      );
    }

    send() {
      if (mocks.afterSend === "reply") {
        setTimeout(() => this.emit("message", JSON.stringify(mocks.reply)));
      } else if (mocks.afterSend === "error") {
        setTimeout(() => this.emit("error", new Error("reset")));
      } else if (mocks.afterSend === "close") {
        setTimeout(() => this.emit("close"));
      }
    }

    close() {}

    terminate() {
      this.terminated = true;
      this.emit("close");
    }
  }

  return {
    FakeWebSocket,
    sockets,
    fail: false,
    afterSend: "reply",
    reply: { message_type: "Ok" },
  };
});

vi.mock("ws", () => ({ default: mocks.FakeWebSocket }));

import { readBotBitpart, sendBitpartMessage } from "./bitpart";

const HOST = "bitpart-0.bitpart.bitpart.svc.cluster.local:3000";
let telemetry;

beforeAll(() => {
  process.env.BITPART_SERVER_TOKEN = "server-token";
  telemetry = setUpTestTelemetry();
});

beforeEach(() => {
  mocks.sockets.length = 0;
  mocks.fail = false;
  mocks.afterSend = "reply";
  mocks.reply = { message_type: "Ok" };
  delete process.env.BITPART_REQUEST_TIMEOUT_MS;
  telemetry.spans.reset();
});

describe("bitpart.request", () => {
  it("sends a traceparent for the request's span with the token", async () => {
    await readBotBitpart("bot-123", HOST);

    const { headers } = mocks.sockets[0].options;
    const [span] = telemetry.spans.getFinishedSpans();

    expect(headers.Authorization).toBe("server-token");
    expect(headers.traceparent).toBe(
      `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`,
    );
    expect(span.name).toBe("bitpart.request");
    expect(span.kind).toBe(SpanKind.CLIENT);
    expect(span.attributes).toEqual({
      message_type: "ReadBot",
      bot_id: "bot-123",
      "bitpart.instance": "bitpart-0",
      outcome: "ok",
    });
  });

  it("uses data.bot_id over a channel id", async () => {
    await sendBitpartMessage(HOST, {
      message_type: "SubmitChallenge",
      data: { id: "signal", bot_id: "bot-9", captcha: "secret" },
    });

    const [span] = telemetry.spans.getFinishedSpans();
    expect(span.attributes.bot_id).toBe("bot-9");
    expect(JSON.stringify(span.attributes)).not.toContain("secret");
  });

  it("counts requests and their duration by outcome", async () => {
    await readBotBitpart("bot-1", HOST);
    mocks.reply = { message_type: "Error", data: { response: "nope" } };
    await readBotBitpart("bot-1", HOST);
    mocks.fail = true;
    await expect(readBotBitpart("bot-1", HOST)).rejects.toThrow();

    // metrics are cumulative: the ReadBot in the first test counts too
    const collected = await telemetry.collect();
    const readBot = (name) =>
      collected[name].filter((p) => p.attributes.message_type === "ReadBot");

    expect(
      readBot("dashboard.bitpart.requests").map((p) => [p.attributes, p.value]),
    ).toEqual([
      [
        {
          message_type: "ReadBot",
          "bitpart.instance": "bitpart-0",
          outcome: "ok",
        },
        2,
      ],
      [
        {
          message_type: "ReadBot",
          "bitpart.instance": "bitpart-0",
          outcome: "error",
        },
        1,
      ],
      [
        {
          message_type: "ReadBot",
          "bitpart.instance": "bitpart-0",
          outcome: "unreachable",
        },
        1,
      ],
    ]);
    expect(readBot("dashboard.bitpart.request.duration")).toHaveLength(3);
  });

  it("gives up when bitpart doesn't reply in time", async () => {
    process.env.BITPART_REQUEST_TIMEOUT_MS = "20";
    mocks.afterSend = "nothing";

    await expect(readBotBitpart("bot-1", HOST)).rejects.toThrow(
      "didn't reply within 0.02 seconds",
    );

    const [span] = telemetry.spans.getFinishedSpans();
    expect(span.attributes.outcome).toBe("timeout");
    expect(mocks.sockets[0].terminated).toBe(true);
  });

  it("rejects when the connection drops after sending", async () => {
    mocks.afterSend = "error";
    await expect(readBotBitpart("bot-1", HOST)).rejects.toThrow("reset");

    mocks.afterSend = "close";
    await expect(readBotBitpart("bot-1", HOST)).rejects.toThrow(
      "closed the connection",
    );

    const outcomes = telemetry.spans
      .getFinishedSpans()
      .map((span) => span.attributes.outcome);
    expect(outcomes).toEqual(["error", "error"]);
  });
});
