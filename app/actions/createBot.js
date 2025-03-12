"use server"
import fs from 'node:fs/promises';
import { prisma } from '@/lib/prisma';

export const createBot = async (data, userId) => {
  try {
    let file = `./csml/${data.botType}.txt`;
    let csml;

    const template = await fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      return data;
    });

    console.log(template);
    
    // const bot = await prisma.bot.create({
    //   data: {
    //     creatorId: userId,
    //     ...data
    //   }
    // });

    // return bot;
  } catch (e) {
    console.log(e);
  }
}