"use server"
import fs from 'node:fs/promises';
import { prisma } from '@/lib/prisma';

const schema = [
  'botType',
  'botName',
  'phone',
  'countryCode',
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

    let file = `./csml/${data.botType}.txt`;
    let csml = "";

    const template = await fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      return data;
    });

    csml = template;

    schema.map(field => {
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

      }
    })

    // console.log('********************************');

    // console.log(csml);



    // const bot = await prisma.bot.create({
    //   data: {
    //     creatorId: userId,
    //     ...data
    //   }
    // });

    // return bot;
  } catch (e) {
    console.log(e);
  }
}