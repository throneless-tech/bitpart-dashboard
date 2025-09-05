"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import WebSocket from "ws";
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

const deleteBotBitpart = async (botBitpartId, host) => {
  const jsonDeleteBot = {
    message_type: "DeleteBot",
    data: {
      id: botBitpartId,
    },
  };

  const jsonStringDeleteBot = JSON.stringify(jsonDeleteBot);

  // send info to bitpart server via websockets
  const ws = new WSConnection(`ws://${host}/ws`);

  const response = ws
    .start()
    .then(async () => {
      const response = await ws.sendMessage(jsonStringDeleteBot);
      return response;
    })
    .catch((err) => {
      throw new Error(
        err?.message
          ? err.message
          : "Web socket connection was refused. Make sure the server is running.",
      );
    });

  return response;
};

export const deleteBot = async (botId, botBitpartId, username, host) => {
  const MAX_RETRIES = 5;
  let retries = 0;

  let result;
  while (retries < MAX_RETRIES) {
    try {
      result = await prisma.$transaction(
        async (tx) => {
          // delete bot from bitpart server
          const deletedBitpartBot = await deleteBotBitpart(botBitpartId, host);

          if (deletedBitpartBot?.message_type === "Error") {
            throw new Error(deletedBitpartBot.data.response);
          }

          // TODO delete data from the EMS upon deletion

          // find the user to attach the bot to
          const user = await getUser(username);

          // delete bot from prisma db
          const bot = await prisma.bot.delete({
            where: {
              id: botId,
              creatorId: user.id,
            },
          });

          return "deleted";
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
      throw error;
    }
  }
};
