import { auth } from "@/auth";
// import WebSocket from 'ws';

// actions
import { createBotBitpart, createBotPrisma, linkChannelBitpart } from '@/app/actions/createBot.js';

export function GET() {
  const headers = new Headers();
  headers.set('Connection', 'Upgrade');
  headers.set('Upgrade', 'websocket');
  headers.set('Authorization', process.env.BITPART_SERVER_TOKEN)

  return new Response('Upgrade Required', { status: 426, headers });
}

export async function SOCKET(
  client: import('ws').WebSocket,
  request: import('http').IncomingMessage,
  server: import('ws').WebSocketServer,
  context: { params: Record<string, string | string[]> },
) {
  console.log("A client connected to the ws...");
  
  const session = await auth();

  if (!session) {
    console.log("Client is not authenticated, closing connection.");
    client.send(JSON.stringify({ error: 'Unauthenticated' }));
    client.close(4001);
    return;
  }

  console.log('Client authenticated successfully!');

  const botBitpart = await createBotBitpart(request);

  if (botBitpart) await linkChannelBitpart(botBitpart.channel_id);

  const bot = await createBotPrisma(request);

  return bot;
  // const wss = new WebSocket.Server({ noServer: true });
  // wss.on('connection', function connection(ws) {
  //   ws.on('message', function incoming(message) {
  //     console.log('received: %s', message);
  //     ws.send(message);
  //   });
  // });
  // // Upgrade HTTP request to WebSocket connection
  // if (!request.writableEnded) {
  //   request.writeHead(101, {
  //     'Content-Type': 'text/plain',
  //     'Connection': 'Upgrade',
  //     'Upgrade': 'websocket'
  //   });
  //   request.end();
  // }
  // wss.handleUpgrade(req, req.socket, Buffer.alloc(0), function done(ws) {
  //   wss.emit('connection', ws, req);
  // });
}