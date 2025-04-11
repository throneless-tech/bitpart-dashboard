import WebSocket from 'ws';

// actions
import { createBot } from '../../actions/createBot';

export default async function POST(request, response) {
  const res = await request.json()

  console.log('*********************');
  console.log(res);
  console.log('*********************');
  
  // format bot phone
  let phone = res.data.countryCode + res.data.phone;
  phone = phone.replace(/^(\+)|\D/g, "$1");
  phone = `+${phone}`;

  let channelId = '';
  
  const jsonCreateBot = {
    "message_type": "CreateBot",
    "data": {
      "id": phone,
      "name": data.botName,
      "flows": [
        {
          "id": "Default",
          "name": "Default",
          "content": formattedCsml,
          "commands": []
        }
      ],
      "default_flow": "Default",
    }
  }

  const jsonCreateChannel = {
    "message_type": "CreateChannel",
    "data": {
      "id": "signal",
      "bot_id": phone,
    }
  }

  const jsonLinkChannel = {
    "message_type": "LinkChannel",
    "data": {
      "id": channelId,
      "device_name": "bitpart",
    }
  }

  const jsonStringCreateBot = JSON.stringify(jsonCreateBot);
  const jsonStringCreateChannel = JSON.stringify(jsonCreateChannel);
  const jsonStringLinkChannel = JSON.stringify(jsonLinkChannel);

  // send info to bitpart server via websockets
  const ws = new WebSocket(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`, {
    headers: {
      Authorization: process.env.BITPART_SERVER_TOKEN
    }
  });

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log(`Message received from ws: ${data}`);
    const json = JSON.parse(data)

    bitpartErrorHandler(json);
  });

  ws.on('open', function open() {
    console.log("Opening ws connection...");

    ws.send(jsonStringCreateBot);
    ws.send(jsonStringCreateChannel);
    // TODO close ws from here? Bitpart error...
  });

  ws.on('close', function close() {
    console.log('ws is disconnected.');
  });

  const bot = await createBot(data, userId);

  return bot;
  // const wss = new WebSocket.Server({ noServer: true });
  // wss.on('connection', function connection(ws) {
  //   ws.on('message', function incoming(message) {
  //     console.log('received: %s', message);
  //     ws.send(message);
  //   });
  // });
  // // Upgrade HTTP request to WebSocket connection
  // if (!res.writableEnded) {
  //   res.writeHead(101, {
  //     'Content-Type': 'text/plain',
  //     'Connection': 'Upgrade',
  //     'Upgrade': 'websocket'
  //   });
  //   res.end();
  // }
  // wss.handleUpgrade(req, req.socket, Buffer.alloc(0), function done(ws) {
  //   wss.emit('connection', ws, req);
  // });
}