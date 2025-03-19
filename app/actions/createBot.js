"use server"

// base imports
import fs from 'node:fs/promises';
import { prisma } from '@/lib/prisma';
import WebSocket from 'ws';

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

export const createBot = async (data, userId) => {
  try {
    let txtFile = `./csml/${data.botType}.txt`;
    let csml = "";
    let formattedCsml = "";
    let phones = [];

    const template = await fs.readFile(txtFile, 'utf8', (err, data) => {
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

        data[field].map((p, i) => {
          let phone = p.code + p.number;
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
      }

      // fill in csml template with data
      if (csml.includes(`[${field}]`)) {
        let length = 0;

        if (typeof data[field] == "object") {
          length = data[field].length;

          if (field === "faq") {
            let questions = "";
            let answers = "";

            data[field].map((f, i) => {
              questions = questions + `\\n${i + 1}) ${f.question}`

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
          } else if (field === "problems") {
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

    // const date = new Date(Date.now()).toISOString();

    // const csmlFile = await fs.writeFile(`./csml/${data.botType}-${userId}-${date}.csml`, csml, err => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // })

    // format bot phone
    let phone = data.countryCode + data.phone;
    phone = phone.replace(/^(\+)|\D/g, "$1");
    phone = `+${phone}`;

    console.log('++++++++++++++++++++++++++++++');
    console.log(formattedCsml);
    
    console.log('++++++++++++++++++++++++++++++');
    
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

    // const bot = await prisma.bot.create({
    //   data: {
    //     creatorId: userId,
    //     countryCode: data.countryCode,
    //     phone: phone,
    //     adminPhones: {
    //       set: phones
    //     },
    //     botType: data.botType,
    //     botName: data.botName,
    //     name: data.name,
    //     description: data.description ? data.description : null,
    //     safetyTips: data.safetyTips ? data.safetyTips : null,
    //     faq: data.faq ? data.faq : null,
    //   }
    // });

    // return bot;
  } catch (e) {
    console.log(e);
  }
}