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

// update the bot on the bitpart server
export const updateBotBitpart = async (data, bitpartId, passcode, host) => {
  // format csml
  const formattedCsml = await formatCsml(data, passcode);

  const jsonUpdateBot = {
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

  const jsonStringUpdateBot = JSON.stringify(jsonUpdateBot);

  const ws = new WSConnection(`ws://${host}/ws`);

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

export const updateBot = async (
  data,
  botId,
  bitpartId,
  username,
  passcode,
  host,
) => {
  const MAX_RETRIES = 5;
  let retries = 0;

  let result;
  while (retries < MAX_RETRIES) {
    try {
      result = await prisma.$transaction(
        async (tx) => {
          // update bot on bitpart server
          const updatedBitpartBot = await updateBotBitpart(
            data,
            bitpartId,
            passcode,
            host,
          );

          if (updatedBitpartBot?.message_type === "Error") {
            throw new Error(updatedBitpartBot.data.response);
          }

          // update data in the ems, if needed
          let emsData;
          if (
            (data.botType === "esim" || data.botType === "vpn") &&
            data?.csv?.length
          ) {
            emsData = parseCSV(
              updatedBitpartBot.data.response.bot.id,
              data.botType,
              data.csv,
            );
          }

          if (emsData?.error) {
            throw new Error(emsData.error.message);
          }

          // find the user to attach the bot to
          const user = await getUser(username);

          // update the bot in the prisma db
          const bot = await tx.bot.update({
            where: {
              id: botId,
              creatorId: user.id,
            },
            data: {
              ...data,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
      break;
    } catch (error) {
      if (error.code === "P2034") {
        retries++;
        continue;
      }
      throw new Error(error.message);
    }
  }
};
