import WebSocket from "ws";
import { context, propagation, SpanKind } from "@opentelemetry/api";
import {
  bitpartInstance,
  count,
  recordDuration,
  withSpan,
} from "@/app/_lib/otel";
import { logger } from "@/app/_lib/logger";

// inspired by https://lee-sherwood.com/2022/01/resolving-javascript-promises-externally-from-other-class-methods/
class WSConnection {
  _socket = null;
  _readyPromise = null;
  _pending = null;

  constructor(url) {
    this.url = url;
  }

  start(json) {
    if (!process.env.BITPART_SERVER_TOKEN) {
      throw new Error("BITPART_SERVER_TOKEN is not configured.");
    }

    const headers = { Authorization: process.env.BITPART_SERVER_TOKEN };

    // traceparent, so bitpart continues the trace
    propagation.inject(context.active(), headers);

    this._socket = new WebSocket(this.url, { headers });

    // reject whatever is waiting rather than throwing from the listener,
    // which would be an uncaught exception
    this._socket.on("error", (err) => this._fail(err));
    this._socket.on("close", () =>
      this._fail(new Error("Bitpart closed the connection before replying.")),
    );

    this._socket.on("open", () => {
      this._connected(json);
    });
    return new Promise((resolve, reject) => {
      this._readyPromise = { resolve, reject };
    });
  }

  sendMessage(json) {
    return new Promise((resolve, reject) => {
      this._pending = { reject };
      this._socket.send(json);
      this._socket.on("message", (data) => {
        if (data.message_type === "Error") {
          reject(data);
        } else {
          const parsed = JSON.parse(data);
          resolve(parsed);
        }
      });
    });
  }

  close() {
    this._pending = null;
    this._socket?.close();
  }

  // give up on the connection straight away, whatever state it's in
  terminate() {
    this._socket?.terminate();
  }

  _fail(err) {
    const waiting = this._readyPromise ?? this._pending;

    this._readyPromise = null;
    this._pending = null;
    waiting?.reject(err);
  }

  _connected(data) {
    const response = data ? JSON.parse(data) : null;

    if (null !== this._readyPromise) {
      if (this._socket.readyState !== this._socket.OPEN) {
        this._readyPromise.reject(response?.errorMessage);
      } else {
        this._readyPromise.resolve();
      }
      this._readyPromise = null;
    }
  }
}

// how long to wait for bitpart, from connecting to its reply
const DEFAULT_TIMEOUT_MS = 30 * 1000;

export const bitpartTimeout = () =>
  Number(process.env.BITPART_REQUEST_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

const requestBitpart = async (host, message) => {
  const ws = new WSConnection(`ws://${host}/ws`);
  const timeoutMs = bitpartTimeout();
  let connected = false;
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      ws.terminate();
      reject(
        Object.assign(
          new Error(`Bitpart didn't reply within ${timeoutMs / 1000} seconds.`),
          { timedOut: true, unreachable: !connected },
        ),
      );
    }, timeoutMs);
  });

  const request = ws
    .start()
    .then(async () => {
      connected = true;
      try {
        return await ws.sendMessage(JSON.stringify(message));
      } finally {
        ws.close();
      }
    })
    .catch((err) => {
      throw Object.assign(
        new Error(
          connected && err?.message
            ? err.message
            : "Web socket connection was refused. Make sure the server is running.",
          { cause: err },
        ),
        { unreachable: !connected },
      );
    });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

// the attributes bitpart uses too, so the two sides can be matched up
export const bitpartRequestAttributes = (host, message) => {
  const botId = message?.data?.bot_id ?? message?.data?.id;

  return {
    message_type: message?.message_type ?? "unknown",
    "bitpart.instance": bitpartInstance(host),
    ...(typeof botId === "string" && botId !== "signal"
      ? { bot_id: botId }
      : {}),
  };
};

// send a message to a bitpart server via websockets
export const sendBitpartMessage = async (host, message) => {
  const attributes = bitpartRequestAttributes(host, message);

  return withSpan(
    "bitpart.request",
    attributes,
    async (span) => {
      const started = performance.now();
      let outcome = "ok";

      try {
        const response = await requestBitpart(host, message);

        if (response?.message_type === "Error") {
          outcome = "error";
        }

        return response;
      } catch (error) {
        outcome = error?.timedOut
          ? "timeout"
          : error?.unreachable
            ? "unreachable"
            : "error";
        throw error;
      } finally {
        const seconds = (performance.now() - started) / 1000;
        const metric = {
          message_type: attributes.message_type,
          "bitpart.instance": attributes["bitpart.instance"],
          outcome,
        };

        span.setAttribute("outcome", outcome);
        count("dashboard.bitpart.requests", metric);
        recordDuration("dashboard.bitpart.request.duration", seconds, metric);

        const fields = { ...attributes, outcome, duration_ms: seconds * 1000 };

        if (outcome === "unreachable" || outcome === "timeout") {
          logger.error(fields, `bitpart ${outcome}`);
        } else if (outcome === "error") {
          logger.warn(fields, "bitpart request failed");
        } else {
          logger.debug(fields, "bitpart request");
        }
      }
    },
    { kind: SpanKind.CLIENT },
  );
};

export const readBotBitpart = async (bitpartId, host) =>
  sendBitpartMessage(host, {
    message_type: "ReadBot",
    data: {
      id: bitpartId,
    },
  });

// status of the bot's signal channel from a ReadBot response: "linked",
// "unlinked" or "failing". an unrecognised channel status is treated as
// failing, and "unknown" means the status couldn't be read at all.
export const signalChannelStatus = (readBotResponse) => {
  const channels = readBotResponse?.data?.response?.channels;

  if (readBotResponse?.message_type === "Error" || !Array.isArray(channels)) {
    return "unknown";
  }

  const signal = channels.find((c) => c.channel_id === "signal");

  if (!signal) {
    return "unlinked";
  }

  return signal.status === "linked" || signal.status === "unlinked"
    ? signal.status
    : "failing";
};

export const SEND_STATUSES = [
  "ok",
  "failed",
  "challenge_required",
  "rate_limited",
];

// the signal channel's link status plus the result of the bot's most recent
// attempt to send a message. sendStatus is null when bitpart didn't report
// one we recognise.
export const signalChannelHealth = (readBotResponse) => {
  const status = signalChannelStatus(readBotResponse);
  const signal = readBotResponse?.data?.response?.channels?.find?.(
    (c) => c.channel_id === "signal",
  );
  const sendStatus = SEND_STATUSES.includes(signal?.send_status)
    ? signal.send_status
    : null;

  return {
    status,
    sendStatus,
    challengeToken:
      sendStatus === "challenge_required"
        ? (signal.challenge_token ?? null)
        : null,
    retryAt:
      sendStatus === "rate_limited" && signal.retry_at
        ? new Date(signal.retry_at)
        : null,
  };
};

// submit a solved signal captcha. without a token, bitpart uses the challenge
// token it last reported for the channel.
export const submitChallengeBitpart = async (host, { botId, captcha, token }) =>
  sendBitpartMessage(host, {
    message_type: "SubmitChallenge",
    data: {
      id: "signal",
      bot_id: botId,
      captcha,
      ...(token ? { token } : {}),
    },
  });

export const emsUrl = (path) => {
  if (!process.env.EMS_SERVER_HOST) {
    throw new Error("EMS_SERVER_HOST is not configured.");
  }

  return `http://${process.env.EMS_SERVER_HOST}/${path}`;
};
