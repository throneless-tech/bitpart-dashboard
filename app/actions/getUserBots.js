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
