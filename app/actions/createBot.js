"use server"

// base imports
import { prisma } from '@/lib/prisma';
import WebSocket from 'ws';

// actions
import { formatBotName, formatCsml, formatPhone } from './formatBot';

// inspired by https://lee-sherwood.com/2022/01/resolving-javascript-promises-externally-from-other-class-methods/
class WSConnection {

  _socket = null;
  _readyPromise = null;

  constructor(url) {
    this.url = url;
  }

  start(json) {
    this._socket = new WebSocket(this.url, {
      headers: {
        Authorization: process.env.BITPART_SERVER_TOKEN
      }
    });
    this._socket.on('open', () => { this._connected(json); });
    return new Promise((resolve, reject) => {
      this._readyPromise = { resolve, reject };
    });
  }

  sendMessage(json) {
    return new Promise((resolve, reject) => {
      this._socket.send(json);
      this._socket.on('message', (data) => {
        if (data.message_type === "Error") {
          reject(data);
        } else {
          const parsed = JSON.parse(data);
          resolve(parsed);
        }
      });
    });
  } 

  _connected(data) {
    const response = data ? JSON.parse(data) : null;

    if (null !== this._readyPromise) {
      if (this._socket.readyState !== this._socket.OPEN) {
        this._readyPromise.reject(response.errorMessage);
      } else {
        this._readyPromise.resolve();
      }
      this._readyPromise = null;
    }
  }
}

async function bitpartErrorHandler(json) {
  if (json.message_type == "Error") {
    return { error: "An error occurred. Contact and administrator for help." };
  } else {
    return { message: 'Bitpart bot created successfully.' };
  }
}

// create the bot on the bitpart server
export const createBotBitpart = async (data) => {
  // format bot name
  const formattedBotName = await formatBotName(data.botName);

  // format csml
  const formattedCsml = await formatCsml(data);

  const jsonCreateBot = {
    "message_type": "CreateBot",
    "data": {
      "id": formattedBotName,
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

  const jsonStringCreateBot = JSON.stringify(jsonCreateBot);

  let json;

  const ws = new WSConnection(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`);
  const response = ws.start()
    .then(async () => {
      const response = await ws.sendMessage(jsonStringCreateBot, (data) => { console.log('data is: ', data); });

      json = response;
      return response;
    })
    // .then(res => console.log('res now is:', res))
    .catch(err => { throw new Error(err.message) });

  return response;
}

export const createChannelBitPart = async (countryCode, phone) => {
  const formattedPhone = await formatPhone(phone, countryCode);

  const jsonCreateChannel = {
    "message_type": "CreateChannel",
    "data": {
      "id": "signal",
      "bot_id": formattedPhone,
    }
  }

  const jsonStringCreateChannel = JSON.stringify(jsonCreateChannel);

  let isError = false;
  let json;

  // send info to bitpart server via websockets
  const ws = new WebSocket(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`, {
    headers: {
      Authorization: process.env.BITPART_SERVER_TOKEN
    }
  });

  ws.on('error', console.error);

  ws.on('open', function open() {
    console.log("Opening ws connection...");

    ws.send(jsonStringCreateChannel);
  });

  ws.on('close', function close() {
    ws.isAlive = false;
    console.log('ws is disconnected.');
  });

  ws.on('message', async function message(data) {
    // console.log(`Message received from ws: ${data}`);
    json = await JSON.parse(data);

    isError = await bitpartErrorHandler(json);
    ws.close(); // FIXME Bitpart errors on connection close
  });

  if (isError) return { error: 'An error occurred while trying to create the channel for this bot. Contact an admin for support.' }

  return { message: 'Bitpart channel created successfully.' };

}

export const linkChannelBitpart = async (channelId) => {
  // send info to bitpart server via websockets
  const ws = new WebSocket(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`, {
    headers: {
      Authorization: process.env.BITPART_SERVER_TOKEN
    }
  });

  const jsonLinkChannel = {
    "message_type": "LinkChannel",
    "data": {
      "id": channelId,
      "device_name": "bitpart",
    }
  }

  const jsonStringLinkChannel = JSON.stringify(jsonLinkChannel);

  let isError = false;
  let json;

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    // console.log(`Message received from ws: ${data}`);
    json = JSON.parse(data);

    isError = bitpartErrorHandler(json);
    ws.close(); // FIXME Bitpart errors on connection close
  });

  ws.on('open', function open() {
    console.log("Opening ws connection...");

    ws.send(jsonStringLinkChannel);
  });

  ws.on('close', function close() {
    ws.isAlive = false;
    console.log('ws is disconnected.');
  });

  if (isError) return { error: 'An error occurred while trying to link the channel for the bot. Contact an admin for support.' }

  return { message: 'Bitpart channel linked successfully.' };
}

// create the bot in the prisma db
export const createBotPrisma = async (data, userId) => {

  // format bot phone
  let phone = await formatPhone(data.phone, data.countryCode);

  // admin phones array
  let phones = [];

  // format admin phone numbers
  data.adminPhones.map(async (p) => {
    let phone = await formatPhone(p.code + p.number);
    phone = phone.replace(/^(\+)|\D/g, "$1");
    phone = `+${phone}`;
    phones.push(phone);
  })

  try {
    const bot = await prisma.bot.create({
      data: {
        ...data,
        creatorId: userId,
        countryCode: data.countryCode,
        phone: phone,
        adminPhones: phones,
        botType: data.botType,
        botName: data.botName,
        name: data.name,
      }
    });

    return bot;

  } catch (error) {
    throw new Error(error.message);
  }
}