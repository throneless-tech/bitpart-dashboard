"use server"

// base imports
import fs from 'node:fs/promises';
import WebSocket from 'ws';

export const createChannel = async () => {
  try {
    // send info to bitpart server via websockets
    const ws = new WebSocket(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`, {
      headers: {
        Authorization: process.env.BITPART_SERVER_TOKEN
      }
    });

    const json = {
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

    const jsonString = JSON.stringify(json);

    ws.on('error', console.error);

    ws.on('open', function open() {
      ws.send(jsonString);
    });

    ws.on('close', function close() {
      console.log('disconnected');
    });
  } catch (err) {
    console.log(err);
  }
}