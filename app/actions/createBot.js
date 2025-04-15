"use server"

// base imports
import fs from 'node:fs/promises';
import { prisma } from '@/lib/prisma';
import WebSocket from 'ws';

// actions
import { formatPhone } from './formatBot';

const schema = [
  'botType',
  'botName',
  'phone',
  'countryCode',
  'adminPhones',
  'name',
  'description',
  'about',
  'safetyTips',
  'faq',
  'privacyPolicy',
  'activationInstructions',
  'helpInstructions',
  'locations',
  'plans',
  'referral',
  'storageAccess',
  'problems',
  'vpnName'
]

async function bitpartErrorHandler(json) {
  console.log('BITPART RESPONSE:', json.data.response);

  if (json.message_type == "Error") {
    return true;
  } else {
    return false;
  }
}

// create the bot on the bitpart server
export const createBotBitpart = async (data) => {  
  // send info to bitpart server via websockets
  const ws = new WebSocket(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`, {
    headers: {
      Authorization: process.env.BITPART_SERVER_TOKEN
    }
  });

  let file = `./csml/${data.botType}.csml`;
  let csml = "";
  let formattedCsml = "";
  let phones = [];
  // format bot phone
  let phone = await formatPhone(data.phone, data.countryCode);

  const template = await fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    return data;
  });

  csml = template;

  schema.map(field => {
    // format admin phone numbers
    if (field === "adminPhones") {
      let adminPhoneOptions = "";

      data[field].map(async (p, i) => {
        let phone = await formatPhone(p.code + p.number);
        phone = phone.replace(/^(\+)|\D/g, "$1");
        phone = `+${phone}`;
        phones.push(phone);

        if (i === 0) {
          adminPhoneOptions += `"${phone}"`
        } else {
          adminPhoneOptions += ` || event.client.user_id == "${phone}"`
        }
      })

      csml = csml.replace(`[${field}]`, adminPhoneOptions)
      csml = csml.replace(`[${field}.array]`, phones); // TODO need correct parsing
    }

    // fill in csml template with data
    if (csml.includes(`[${field}]`)) {
      let length = 0;

      if (typeof data[field] == "object") {
        length = data[field].length;

        // handle location fields differently for esim and vpn
        if (data.botType === "esim") {
          if (field === "locations") { // fields specific to esim locations
            let places = "";

            data[field].map((f, i) => {
              places = places + `\\n${i + 1}) ${f.place}`;
            })

            csml = csml.replace(`[${field}]`, places);
            csml = csml.replace(`[${field}.length]`, (length + 1));
          }
        } else if (data.botType === "vpn") {
          if (field === "locations") { // fields specific to vpn locations
            let places = "";

            data[field].map((f, i) => {
              if (i === data[field].length - 1) {
                places = places + `${f.place}`;
              }
              places = places + `${f.place}, `;
            })

            csml = csml.replace(`[${field}]`, places);
            csml = csml.replace(`[${field}.length]`, (length + 1));
          }
        }

        if (field === "faq") { // fields specific to FAQ
          let questions = "";
          let answers = "";

          data[field].map((f, i) => {
            questions = questions + `\\n${i + 1}) ${f.question}`;

            answers = answers + `
              ${i === 0 ? "" : "else"} if (event == ${i + 1}) {
                say "${f.answer}"
                goto check_if_solved_step
              }
              `
          })

          csml = csml.replace(`[${field}]`, questions);
          csml = csml.replace(`[${field}.length]`, (length + 1));
          csml = csml.replace(`[${field}.answers]`, answers);
        } else if (field === "problems") { // fields specific to problem and solutions
          let problems = "";
          let solutions = "";

          data[field].map((f, i) => {
            problems = problems + `\\n${i + 1}) ${f.problem}`

            solutions = solutions + `
              ${i === 0 ? "" : "else"} if (event == ${i + 1}) {
                say "${f.solution}"
                goto check_if_solved_step
              }
              `
          })

          csml = csml.replace(`[${field}]`, problems);
          csml = csml.replace(`[${field}.length]`, (length + 1));
          csml = csml.replace(`[${field}.solutions]`, solutions);
        }
      } else {
        csml = csml.replace(`[${field}]`, data[field]);
      }

      let regex = /"/g;
      let quot = String.raw`\"`;
      formattedCsml = csml.replaceAll(regex, quot);
      // formattedCsml = `"${formattedCsml}"`;
    }
  })

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


  const jsonStringCreateBot = JSON.stringify(jsonCreateBot);

  let isError = false;
  let json;

  ws.on('error', console.error);

  ws.on('open', function open() {
    console.log("Opening ws connection...");

    ws.send(jsonStringCreateBot);
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

  if (isError) return { error: 'An error occurred while trying to create this bot. Contact an admin for support.' }

  return {message: 'Bitpart bot created successfully.'};
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
  data.adminPhones.map(async (p, i) => {
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