"use server";

// base imports
import fs from "node:fs/promises";

const schema = [
  "about",
  "activationInstructions",
  // 'adminPhones',
  "botType",
  "botName",
  "countryCode",
  "csv",
  "description",
  "faq",
  "helpInstructions",
  "locations",
  "maxCodes",
  "name",
  "phone",
  // 'plans',
  "problems",
  "privacyPolicy",
  "referral",
  "responseTime",
  "safetyTips",
  "storageAccess",
  "storageTime",
  "vpnName",
];

export const createPasscode = async () => {
  let result = "";
  const length = 8;
  const characters = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
};

// format the name of the bot for bitpart bot id
export const formatBotName = async (botName, userId) => {
  let formattedBotName = botName.replace(/\s/g, "_");
  formattedBotName = `${formattedBotName}_${userId}`;

  return formattedBotName;
};

// format the csml string for bitpart
export const formatCsml = async (data, passcode) => {
  const file = `./csml/${data.botType}.csml`;
  let csml = "";
  let formattedCsml = "";
  const phones = [];

  const template = await fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    return data;
  });

  csml = template;

  schema.map((field) => {
    // format admin phone numbers
    if (field === "adminPhones") {
      let adminPhoneOptions = "";

      data[field].map((p, i) => {
        let phone = p.code + p.number;
        phone = phone.replace(/^(\+)|\D/g, "$1");
        phone = `+${phone}`;
        phones.push(phone);

        if (i === 0) {
          adminPhoneOptions += `"${phone}"`;
        } else {
          adminPhoneOptions += ` || event.client.user_id == "${phone}"`;
        }
      });

      csml = csml.replace(`[${field}]`, adminPhoneOptions);
      csml = csml.replace(`[${field}.array]`, phones); // TODO need correct parsing
    }

    // fill in csml template with data
    if (csml.includes(`[${field}]`)) {
      let length = 0;

      if (typeof data[field] == "object") {
        length = data[field].length;

        // handle location fields differently for esim and vpn
        if (data.botType === "esim") {
          if (field === "locations") {
            // fields specific to esim locations
            let places = "";

            data[field].map((f, i) => {
              places = places + `\n${i + 1}. ${f.place}`;
            });

            csml = csml.replace(`[${field}]`, places);
            csml = csml.replace(`[${field}.length]`, length + 1);
          }
        } else if (data.botType === "vpn") {
          if (field === "locations") {
            // fields specific to vpn locations
            let places = "";

            data[field].map((f, i) => {
              if (i === data[field].length - 1) {
                places = places + `${f.place}`;
              }
              places = places + `${f.place}, `;
            });

            csml = csml.replace(`[${field}]`, places);
            csml = csml.replace(`[${field}.length]`, length + 1);
          }
        }

        if (field === "faq") {
          // fields specific to FAQ
          let questions = "";
          let answers = "";

          if (data[field].length) {
            questions =
              "FAQ\n\nHere are some frequently asked questions. Does your question fall under one of these?\n";

            data[field].map((f, i) => {
              if (f.question.length) {
                questions = questions + `${i + 1}. ${f.question}\n`;
              }

              if (f.answer.length) {
                answers =
                  answers +
                  `if (event == ${i + 1}) {
                say "${f.answer}"
                goto check_if_solved_step
              } else `;
              }
            });

            questions =
              questions +
              `${data[field].length + 1}. Other\n\nReply with the number.`;

            csml = csml.replace(`[${field}.length]`, length + 1);
            csml = csml.replace(`[${field}.answers]`, answers);
          } else {
            questions = "Apologies, no FAQ have been entered for this bot.";
            csml = csml.replace("[faq.answers]", "");
          }

          csml = csml.replace(`[${field}]`, questions);
        } else if (field === "problems") {
          // fields specific to problem and solutions
          let problems = "";
          let solutions = "";

          data[field].map((f, i) => {
            problems = problems + `\n${i + 1}. ${f.problem}`;

            solutions =
              solutions +
              `
              ${i === 0 ? "" : "else"} if (event == ${i + 1}) {
                say "${f.solution}"
                goto check_if_solved_step
              }
              `;
          });

          csml = csml.replaceAll(`[${field}]`, problems);
          csml = csml.replaceAll(`[${field}.length]`, length + 1);
          csml = csml.replaceAll(`[${field}.solutions]`, solutions);
        }
      } else {
        csml = csml.replaceAll(`[${field}]`, data[field]);
      }

      csml = csml.replaceAll(`[passcode]`, passcode);

      formattedCsml = csml;

      // const regex = /"/g;
      // const quot = String.raw`\"`;
      // formattedCsml = csml.replaceAll(regex, quot);
      // formattedCsml = `"${formattedCsml}"`;
    }
  });

  return formattedCsml;
};

// format the json string to create a bot, to send to bitpart
export const formatCreateBotData = async (data, formattedCsml) => {
  const formattedPhone = await formatPhone(data.phone, data.countryCode);

  const jsonCreateBot = {
    message_type: "CreateBot",
    data: {
      id: formattedPhone,
      name: data.botName,
      flows: [
        {
          id: "Default",
          name: "Default",
          content: formattedCsml,
          commands: [],
        },
      ],
      default_flow: "Default",
    },
  };

  const jsonStringCreateBot = JSON.stringify(jsonCreateBot);

  return jsonStringCreateBot;
};

// format the bot phone correctly for bitpart
export const formatPhone = async (phone, countryCode) => {
  let formattedPhone = `${countryCode} ${phone}`;
  // formattedPhone = formattedPhone.replace(/^(\+)|\D/g, "$1");
  formattedPhone = `+${formattedPhone}`;

  return formattedPhone;
};
