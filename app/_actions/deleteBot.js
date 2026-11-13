"use server";
import { traceAction } from "@/app/_lib/otel";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUser } from "./getUser";
import { deleteFromEMS } from "./ems";
import { sendBitpartMessage } from "@/app/_lib/bitpart";
import { errorFields, logger } from "@/app/_lib/logger";
import { recordBotEvent } from "@/app/_lib/events";

const deleteBotBitpart = async (botBitpartId, host) => {
  const jsonDeleteBot = {
    message_type: "DeleteBot",
    data: {
      id: botBitpartId,
    },
  };

  return sendBitpartMessage(host, jsonDeleteBot);
};

// botBitpartId and host are accepted for backwards compatibility with
// existing but are intentionally ignored
export const deleteBot = traceAction(
  "action.deleteBot",
  async (botId, _botBitpartId, username, _host) => {
    const user = await getUser(username);

    if (!user) {
      throw new Error("Not authorized to delete this bot.");
    }

    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
        creatorId: user.id,
      },
    });

    if (!bot) {
      throw new Error("Bot not found.");
    }

    const event = {
      event: "deleted",
      botType: bot.botType,
      botId: bot.bitpartId,
      userId: user.id,
    };

    try {
      await removeBot(bot, user);
    } catch (error) {
      recordBotEvent({ ...event, outcome: "error" });
      throw error;
    }

    recordBotEvent(event);
  },
);

const removeBot = async (bot, user) => {
  const deletedBitpartBot = await deleteBotBitpart(bot.bitpartId, bot.instance);

  if (deletedBitpartBot?.message_type === "Error") {
    throw new Error(deletedBitpartBot.data.response);
  }

  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await prisma.$transaction(
        async (tx) => {
          await tx.bot.delete({
            where: {
              id: bot.id,
              creatorId: user.id,
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
      throw error;
    }
  }

  if (retries === MAX_RETRIES) {
    throw new Error(
      "Failed to delete bot after repeated serialization failures.",
    );
  }

  // remove the bot's data from the EMS after the DB delete
  try {
    await deleteFromEMS(bot.bitpartId, bot.botType);
  } catch (error) {
    logger.error(
      { bot_id: bot.bitpartId, ...errorFields(error) },
      "EMS cleanup failed",
    );
  }
};
