"use server"
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

    // console.log('data is: ', data);

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
        let phone = data.countryCode + data.phone;
        phone = phone.replace(/^(\+)|\D/g, "$1");
        phone = `+${phone}`;
        phones.push(phone);
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

            // console.log('questions: ', questions);

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
        formattedCsml = `"${formattedCsml}"`;
      }
    })

    // const date = new Date(Date.now()).toISOString();

    // const csmlFile = await fs.writeFile(`./csml/${data.botType}-${userId}-${date}.csml`, csml, err => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // })

    const ws = new WebSocket(`ws://${process.env.BITPART_SERVER_URL}:${process.env.BITPART_SERVER_PORT}/ws`);

    ws.on('connection', function connection(ws, request, client) {
      console.log('we are now connected....');
      
      ws.on('error', console.error);

      authenticate(request, function next(err, client) {
        if (err || !client) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        socket.removeListener('error', onSocketError);

        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request, client);
        });
      });
    });
    
    // format bot phone
    let phone = data.countryCode + data.phone;
    phone = phone.replace(/^(\+)|\D/g, "$1");
    phone = `+${phone}`;


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