import WebSocket from "ws";

// inspired by https://lee-sherwood.com/2022/01/resolving-javascript-promises-externally-from-other-class-methods/
class WSConnection {
  _socket = null;
  _readyPromise = null;

  constructor(url) {
    this.url = url;
  }

  start(json) {
    if (!process.env.BITPART_SERVER_TOKEN) {
      throw new Error("BITPART_SERVER_TOKEN is not configured.");
    }

    this._socket = new WebSocket(this.url, {
      headers: {
        Authorization: process.env.BITPART_SERVER_TOKEN,
      },
    });

    this._socket.on("error", (err) => {
      this._connected(false);
      throw new Error(err.message);
    });

    this._socket.on("open", () => {
      this._connected(json);
    });
    return new Promise((resolve, reject) => {
      this._readyPromise = { resolve, reject };
    });
  }

  sendMessage(json) {
    return new Promise((resolve, reject) => {
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
    this._socket?.close();
  }

  _connected(data) {
    if (data === false) {
      this._readyPromise.reject();
    } else {
      const response = data ? JSON.parse(data) : null;

      if (null !== this._readyPromise) {
        if (this._socket.readyState !== this._socket.OPEN) {
          this._readyPromise.reject(response.errorMessage);
        } else {
          this._readyPromise.resolve();
        }
        this._readyPromise = null;
      }
    }
  }
}

// send a message to a bitpart server via websockets
export const sendBitpartMessage = async (host, message) => {
  const ws = new WSConnection(`ws://${host}/ws`);

  return ws
    .start()
    .then(async () => {
      try {
        return await ws.sendMessage(JSON.stringify(message));
      } finally {
        ws.close();
      }
    })
    .catch((err) => {
      throw new Error(
        err?.message
          ? err.message
          : "Web socket connection was refused. Make sure the server is running.",
      );
    });
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
