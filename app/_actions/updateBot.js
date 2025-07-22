"use server";

// base imports
import { prisma } from "@/lib/prisma";
import WebSocket from "ws";

// actions
import { formatCsml, formatPhone } from "./formatBot";

// inspired by https://lee-sherwood.com/2022/01/resolving-javascript-promises-externally-from-other-class-methods/
class WSConnection {
  _socket = null;
  _readyPromise = null;

  constructor(url) {
    this.url = url;
  }

  start(json) {
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

// update the bot on the bitpart server
export const updateBotBitpart = async (data, bitpartId, passcode) => {
  // format csml
  const formattedCsml = await formatCsml(data, passcode);

  const jsonUpdateBot = {
    message_type: "CreateBot",
    data: {
      id: bitpartId,
      name: data.botName,
      apps_endpoint: `http://${process.env.EMS_SERVER_URL}:${process.env.EMS_PORT}${process.env.EMS_ENDPOINT}`,
      flows: [
        {
          id: "Default",
          name: "Default",
          content: formattedCsml,
          commands: [],
        },
      ],
      default_flow: "Default",
    },
  };

  const jsonStringUpdateBot = JSON.stringify(jsonUpdateBot);

  const ws = new WSConnection(
    `ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`,
  );

  const response = ws
    .start()
    .then(async () => {
      const response = await ws.sendMessage(jsonStringUpdateBot);
      return response;
    })
    .catch((err) => {
      throw new Error(
        err?.message
          ? err.message
          : "Web socket connection was refused.Make sure the server is running.",
      );
    });

  return response;
};

// update the bot in the prisma db
export const updateBotPrisma = async (
  data,
  botId,
  bitpartId,
  userId,
  passcode,
) => {
  try {
    delete data.csv; // we are not saving the codes here

    const bot = await prisma.bot.update({
      where: {
        id: botId,
      },
      data: {
        ...data,
      },
    });

    return bot;
  } catch (error) {
    throw new Error(error.message);
  }
};
