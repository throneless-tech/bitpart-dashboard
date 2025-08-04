"use server";
import { prisma } from "@/lib/prisma";

const getUser = async (username) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return user;
};

export const getUserBots = async (username) => {
  try {
    const user = await getUser(username);
    const bots = await prisma.bot.findMany({
      where: {
        creator: user,
      },
    });

    return bots;
  } catch (e) {
    console.log(e);
  }
};

export const getBot = async (botId, username) => {
  try {
    const user = await getUser(username);
    const bot = await prisma.bot.findUnique({
      where: {
        id: botId,
        creator: user,
      },
    });

    return bot;
  } catch (e) {
    console.log(e);
  }
};
