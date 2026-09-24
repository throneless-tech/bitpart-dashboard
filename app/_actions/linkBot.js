"use server";
import { prisma } from "@/lib/prisma";
import { getUser } from "./getUser";
import { linkChannelBitpart } from "./createBot";
import { readBotBitpart, signalChannelStatus } from "@/app/_lib/bitpart";

// find a bot owned by the logged in user
const getOwnedBot = async (botId, username) => {
  const user = await getUser(username);

  if (!user) {
    throw new Error("Not authorized to access this bot.");
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

  return bot;
};

// get the status of the bot's signal channel from the bitpart server
export const getBotStatus = async (botId, username) => {
  const bot = await getOwnedBot(botId, username);

  try {
    const response = await readBotBitpart(bot.bitpartId, bot.instance);
    return signalChannelStatus(response);
  } catch (error) {
    console.error("ReadBot failed for bot", bot.bitpartId, error);
    return "unknown";
  }
};

// send a new LinkChannel, which replaces the bot's existing signal channel
export const relinkBot = async (botId, username) => {
  const bot = await getOwnedBot(botId, username);

  const channelLink = await linkChannelBitpart(
    bot.bitpartId,
    bot.instance,
    bot.botName,
    bot.expireTimer,
  );

  if (channelLink?.message_type === "Error") {
    throw new Error(channelLink.data.response);
  }

  const qrLink = channelLink.data.response;

  await prisma.bot.update({
    where: {
      id: bot.id,
      creatorId: bot.creatorId,
    },
    data: {
      qrLink,
    },
  });

  return { qr: qrLink };
};
