"use server";

// base imports
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import WebSocket from "ws";

// actions
import { formatCsml } from "./formatBot";
import { getUser } from "./getUser";
import { parseCSV } from "./csv";

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
export const createBotBitpart = async (data, bitpartId, passcode, host) => {
  // format csml
  const formattedCsml = await formatCsml(data, passcode);

  const jsonCreateBot = {
    message_type: "CreateBot",
    data: {
      id: bitpartId,
      name: data.botName,
      apps_endpoint: `http://${process.env.EMS_SERVER_HOST}/ems`,
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

  const ws = new WSConnection(`ws://${host}/ws`);

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

export const linkChannelBitpart = async (botId, host) => {
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
  const ws = new WSConnection(`ws://${host}/ws`);

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

export const createBot = async (data, bitpartId, username, passcode) => {
  const MAX_RETRIES = 5;
  let retries = 0;

  let result;
  while (retries < MAX_RETRIES) {
    try {
      result = await prisma.$transaction(
        async (tx) => {
          delete data.csv; // we are not saving the codes here

          // configure which instance this bot should be attached to
          let host = "";

          const hostsList = process.env.BITPART_SERVER_HOSTS;

          const hosts = hostsList.split(",");

          const lastHost = await tx.state.findUnique({
            where: {
              name: "default",
            },
          });

          if (hosts.includes(lastHost.lastInstance)) {
            const index = hosts.indexOf(lastHost.lastInstance);

            if (index === 0) {
              host = hosts[1];
            } else if (!index) {
              host = hosts[0];
            } else if (!!index && index >= hosts.length - 1) {
              host = hosts[0];
            } else {
              host = hosts[index + 1];
            }
          } else {
            host = hosts[0];
          }

          // create the bot in the bitpart server
          const bitpartBot = await createBotBitpart(
            data,
            bitpartId,
            passcode,
            host,
          );

          if (bitpartBot?.message_type === "Error") {
            throw new Error(bitpartBot.data.response);
          }

          let emsData;
          if (data.botType === "esim" || data.botType === "vpn") {
            emsData = parseCSV(
              bitpartBot.data.response.bot.id,
              data.botType,
              data.csv,
            );
          }

          if (emsData?.error) {
            throw new Error(emsData.error.message);
          }

          const channelLink = await linkChannelBitpart(
            bitpartBot.data.response.bot.id,
            host,
          );

          if (channelLink?.message_type === "Error") {
            throw new Error(channelLink.data.response);
          }

          // find the user to attach the bot to
          const user = await getUser(username);

          // create the bot in the prisma db
          const bot = await tx.bot.create({
            data: {
              ...data,
              creatorId: user.id,
              countryCode: data?.countryCode || "",
              // phone,
              // adminPhones: phones,
              passcode,
              botType: data.botType,
              botName: data.botName,
              bitpartId,
              name: data.name,
              qrLink: channelLink.data.response,
              instance: host,
            },
          });

          const thisHost = await tx.state.update({
            where: {
              name: "default",
            },
            data: {
              lastInstance: host,
            },
          });

          return { bot, qr: channelLink.data.response };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
      return result;
    } catch (error) {
      if (error.code === "P2034") {
        retries++;
        continue;
      }
      throw new Error(error.message);
    }
  }
};
