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

// create the bot on the bitpart server
export const createBotBitpart = async (data, passcode) => {
  // format bot name
  const formattedBotName = await formatBotName(data.botName);

  // format csml
  const formattedCsml = await formatCsml(data, passcode);

  const jsonCreateBot = {
    "message_type": "CreateBot",
    "data": {
      "id": formattedBotName,
      "name": data.botName,
      "apps_endpoint": process.env.EMS_ENDPOINT,
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

  const ws = new WSConnection(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`);
  const response = ws.start()
    .then(async () => {
      const response = await ws.sendMessage(jsonStringCreateBot);

      return response;
    })
    // .then(res => console.log('res now is:', res))
    .catch(err => { throw new Error(err.message) });

  return response;
}

export const linkChannelBitpart = async (botId) => {
  
  const jsonLinkChannel = {
    "message_type": "LinkChannel",
    "data": {
      "id": "signal",
      "bot_id": botId,
      "device_name": "bitpart",
    }
  }

  const jsonStringLinkChannel = JSON.stringify(jsonLinkChannel);


  // send info to bitpart server via websockets
  const ws = new WSConnection(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`);
  const response = ws.start()
    .then(async () => {
      const response = await ws.sendMessage(jsonStringLinkChannel);

      return response;
    })
    // .then(res => console.log('res now is:', res))
    .catch(err => { throw new Error(err.message) });

  return response;
}

// create the bot in the prisma db
export const createBotPrisma = async (data, userId, passcode) => {

  // format bot phone
  let phone = "";

  if (data.phone.length > 0) {
    phone = await formatPhone(data.phone, data.countryCode);
  }

  // // admin phones array
  // let phones = [];

  // // format admin phone numbers
  // data.adminPhones.map(async (p) => {
  //   let phone = await formatPhone(p.code + p.number);
  //   phone = phone.replace(/^(\+)|\D/g, "$1");
  //   phone = `+${phone}`;
  //   phones.push(phone);
  // })

  try {
    delete data.csv; // we are not saving the codes here

    const bot = await prisma.bot.create({
      data: {
        ...data,
        creatorId: userId,
        countryCode: data.countryCode,
        phone: phone,
        // adminPhones: phones,
        passcode: passcode,
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