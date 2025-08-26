"use server";

import { prisma } from "@/lib/prisma";

// actions
import { getUser } from "./getUser";

export const getUserBots = async (username) => {
  try {
    const user = await getUser(username);

    const bots = await prisma.bot.findMany({
      where: {
        creatorId: user.id,
      },
    });

    return {
      bots,
      user: {
        consent_agree: user.consent_agree,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBot = async (botId, username) => {
  try {
    const user = await getUser(username);
    const bot = await prisma.bot.findUnique({
      where: {
        id: botId,
        creatorId: user.id,
      },
    });

    return bot;
  } catch (error) {
    throw new Error(error.message);
  }
};
