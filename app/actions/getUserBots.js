"use server";
import { prisma } from "@/lib/prisma";

export const getUserBots = async (userId) => {
  try {
    const bots = await prisma.bot.findMany({
      where: {
        creatorId: userId,
      },
    });

    return bots;
  } catch (e) {
    console.log(e);
  }
};

export const getBot = async (botId) => {
  try {
    const bot = await prisma.bot.findUnique({
      where: {
        id: botId,
      },
    });

    return bot;
  } catch (e) {
    console.log(e);
  }
};
