"use server"
import { prisma } from '@/lib/prisma';

export const deleteBot = async (botId) => {
  try {
    const bot = await prisma.bot.delete({
      where: {
        id: botId,
      }
    });

    return "deleted";
  } catch (e) {
    console.log(e);
  }
}