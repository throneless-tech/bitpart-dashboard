"use server";

// base imports
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// actions
import { formatCsml } from "./formatBot";
import { getUser } from "./getUser";

// utils
import { escapeSpecials } from "@/app/_utils/escapeSpecials";
import { emsUrl, sendBitpartMessage } from "@/app/_lib/bitpart";

// update the bot on the bitpart server
export const updateBotBitpart = async (data, bitpartId, passcode, host) => {
  const appsEndpoint = emsUrl("ems");

  // format csml
  const formattedCsml = await formatCsml(data, passcode);

  const jsonUpdateBot = {
    message_type: "CreateBot",
    data: {
      id: bitpartId,
      name: data.botName,
      apps_endpoint: appsEndpoint,
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

  return sendBitpartMessage(host, jsonUpdateBot);
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
          delete data.csv; // we are not saving the codes here

          const formattedData = escapeSpecials(data);

          // update bot on bitpart server
          const updatedBitpartBot = await updateBotBitpart(
            formattedData,
            bitpartId,
            passcode,
            host,
          );

          if (updatedBitpartBot?.message_type === "Error") {
            throw new Error(updatedBitpartBot.data.response);
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

          return bot;
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
