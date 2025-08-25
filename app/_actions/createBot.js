"use server";

// base imports
import { prisma } from "@/lib/prisma";
import WebSocket from "ws";

// actions
import { formatCsml } from "./formatBot";
import { getUser } from "./getUser";

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

// create the bot on the bitpart server
export const createBotBitpart = async (data, bitpartId, passcode) => {
  // format csml
  const formattedCsml = await formatCsml(data, passcode);

  const jsonCreateBot = {
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

  const jsonStringCreateBot = JSON.stringify(jsonCreateBot);

  const ws = new WSConnection(
    `ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`,
  );

  const response = ws
    .start()
    .then(async () => {
      const response = await ws.sendMessage(jsonStringCreateBot);
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

export const linkChannelBitpart = async (botId) => {
  const jsonLinkChannel = {
    message_type: "LinkChannel",
    data: {
      id: "signal",
      bot_id: botId,
      device_name: "bitpart",
    },
  };

  const jsonStringLinkChannel = JSON.stringify(jsonLinkChannel);

  // send info to bitpart server via websockets
  const ws = new WSConnection(
    `ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`,
  );

  // if (!ws?._socket) {
  //   throw new Error("Cannot connect to Bitpart server. Make sure the server is running.")
  // }

  const response = ws
    .start()
    .then(async () => {
      const response = await ws.sendMessage(jsonStringLinkChannel);

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

// create the bot in the prisma db
export const createBotPrisma = async (data, bitpartId, username, passcode) => {
  try {
    delete data.csv; // we are not saving the codes here

    const user = await getUser(username);

    const bot = await prisma.bot.create({
      data: {
        ...data,
        creatorId: user.id,
        // countryCode: data.countryCode,
        // phone,
        // adminPhones: phones,
        passcode,
        botType: data.botType,
        botName: data.botName,
        bitpartId,
        name: data.name,
      },
    });

    return bot;
  } catch (error) {
    throw new Error(error.message);
  }
};
