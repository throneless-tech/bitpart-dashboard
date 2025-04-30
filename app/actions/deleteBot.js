"use server";
import { prisma } from "@/lib/prisma";

export const deleteBot = async (botId, botPhone) => {
  // FIXME uncomment when ready
  // send info to bitpart server via websockets
  // const ws = new WebSocket(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`, {
  //   headers: {
  //     Authorization: process.env.BITPART_SERVER_TOKEN
  //   }
  // });

  // let isError = false;

  // const jsonDeleteBot = {
  //   "message_type": "Delete",
  //   "data": {
  //     "id": botPhone,
  //   }
  // }

  // const jsonStringDeleteBot = JSON.stringify(jsonDeleteBot);

  // ws.on('error', console.error);

  // ws.on('open', function open() {
  //   console.log("Opening ws connection...");

  //   ws.send(jsonStringDeleteBot);
  // });

  // ws.on('close', function close() {
  //   ws.isAlive = false;
  //   console.log('ws is disconnected.');
  // });

  // ws.on('message', async function message(data) {
  //   // console.log(`Message received from ws: ${data}`);
  //   json = await JSON.parse(data);

  //   isError = await bitpartErrorHandler(json);
  //   ws.close(); // FIXME Bitpart errors on connection close
  // });

  // if (isError) return { error: 'An error occurred while trying to delete this bot. Contact an admin for support.' }

  try {
    const bot = await prisma.bot.delete({
      where: {
        id: botId,
      },
    });

    return "deleted";
  } catch (e) {
    console.log(e);
  }
};
