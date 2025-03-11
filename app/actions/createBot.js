"use server"
import { prisma } from '@/lib/prisma';

export const createBot = async (data, userId) => {
  try {
    const bot = await prisma.bot.create({
      data: {
        creatorId: userId,
        ...data
      }
    });

    return bot;
  } catch (e) {
    console.log(e);
  }
}