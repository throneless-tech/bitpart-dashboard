import { auth } from "@/auth";
// import WebSocket from 'ws';

// actions
import {
  createBotBitpart,
  createBotPrisma,
  linkChannelBitpart,
} from "@/app/actions/createBot.js";

export function GET() {
  const headers = new Headers();
  headers.set("Connection", "Upgrade");
  headers.set("Upgrade", "websocket");
  headers.set("Authorization", process.env.BITPART_SERVER_TOKEN);

  console.log("IN GET.........");

  return new Response("Upgrade Required", { status: 426, headers });
}

export async function SOCKET(
  client: import("ws").WebSocket,
  request: import("http").IncomingMessage,
  server: import("ws").WebSocketServer,
  context: { params: Record<string, string | string[]> },
) {
  console.log("A client connected to the ws...");

  const session = await auth();

  if (!session) {
    console.log("Client is not authenticated, closing connection.");
    client.send(JSON.stringify({ error: "Unauthenticated" }));
    client.close(4001);
    return;
  }

  console.log("Client authenticated successfully!");

  client.on("message", (message) => {
    console.log("message is: ", message);
  });

  client.send(
    JSON.stringify({
      author: "System",
      content: `Welcome to the chat!`,
    }),
  );

  // const botBitpart = await createBotBitpart(request);

  // console.log(botBitpart);

  // if (botBitpart) await linkChannelBitpart(botBitpart.channel_id);

  // const bot = await createBotPrisma(request);

  // return bot;
}
