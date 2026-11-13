"use server";
import { traceAction } from "@/app/_lib/otel";
import { recordBotEvent } from "@/app/_lib/events";

// base imports
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// actions
import { formatCsml } from "./formatBot";
import { getUser } from "./getUser";

// utils
import { escapeSpecials } from "@/app/_utils/escapeSpecials";
import { emsUrl, sendBitpartMessage } from "@/app/_lib/bitpart";
import { expireTimerSeconds } from "@/app/_lib/expireTimer";

// create the bot on the bitpart server
export const createBotBitpart = async (
  data,
  bitpartId,
  passcode,
  host,
  expireTimer,
) => {
  const appsEndpoint = emsUrl("ems");

  // format csml
  const formattedCsml = await formatCsml(data, passcode);

  const jsonCreateBot = {
    message_type: "CreateBot",
    data: {
      id: bitpartId,
      apps_endpoint: appsEndpoint,
      flows: [
        {
          id: "Default",
          name: "Default",
          content: formattedCsml,
          commands: [],
        },
      ],
      default_flow: "Default",
      expire_timer: expireTimer,
    },
  };

  return sendBitpartMessage(host, jsonCreateBot);
};

export const linkChannelBitpart = traceAction(
  "action.linkChannelBitpart",
  async (botId, host, profileName) => {
    const jsonLinkChannel = {
      message_type: "LinkChannel",
      data: {
        id: "signal",
        bot_id: botId,
        device_name: "bitpart",
        profile_name: profileName,
      },
    };

    return sendBitpartMessage(host, jsonLinkChannel);
  },
);

export const createBot = traceAction(
  "action.createBot",
  async (data, bitpartId, username, passcode) => {
    const MAX_RETRIES = 5;
    let retries = 0;

    let result;
    while (retries < MAX_RETRIES) {
      try {
        result = await prisma.$transaction(
          async (tx) => {
            delete data.csv; // we are not saving the codes here

            const expireTimer = expireTimerSeconds(data);

            if (expireTimer === null) {
              throw new Error("Invalid disappearing messages timer.");
            }

            delete data.expireTimerCustomValue;
            delete data.expireTimerCustomUnit;
            data.expireTimer = expireTimer;

            // configure which instance this bot should be attached to
            let host = "";

            const hostsList = process.env.BITPART_SERVER_HOSTS;

            if (!hostsList) {
              throw new Error("BITPART_SERVER_HOSTS is not configured.");
            }

            const hosts = hostsList.split(",");

            const lastHost = await tx.state.findUnique({
              where: {
                name: "default",
              },
            });

            if (hosts.length === 1) {
              host = hosts[0];
            } else if (hosts.includes(lastHost?.lastInstance)) {
              const index = hosts.indexOf(lastHost?.lastInstance);

              if (index === 0) {
                host = hosts[1];
              } else if (!index) {
                host = hosts[0];
              } else if (!!index && index >= hosts.length - 1) {
                host = hosts[0];
              } else {
                host = hosts[index + 1];
              }
            } else {
              host = hosts[0];
            }

            const formattedData = escapeSpecials(data);

            // create the bot in the bitpart server
            const bitpartBot = await createBotBitpart(
              formattedData,
              bitpartId,
              passcode,
              host,
              expireTimer,
            );

            if (bitpartBot?.message_type === "Error") {
              throw new Error(bitpartBot.data.response);
            }

            const channelLink = await linkChannelBitpart(
              bitpartBot.data.response.bot.id,
              host,
              data.botName,
            );

            if (channelLink?.message_type === "Error") {
              throw new Error(channelLink.data.response);
            }

            // find the user to attach the bot to
            const user = await getUser(username);

            // create the bot in the prisma db
            const bot = await tx.bot.create({
              data: {
                ...data,
                creatorId: user.id,
                countryCode: data?.countryCode || "",
                // phone,
                // adminPhones: phones,
                passcode,
                botType: data.botType,
                botName: data.botName,
                bitpartId,
                name: data.name,
                qrLink: channelLink.data.response,
                instance: host,
              },
            });

            await tx.state.update({
              where: {
                name: "default",
              },
              data: {
                lastInstance: host,
              },
            });

            return { bot, qr: channelLink.data.response };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
        recordBotEvent({
          event: "created",
          botType: data.botType,
          botId: bitpartId,
        });
        return result;
      } catch (error) {
        if (error.code === "P2034") {
          retries++;
          continue;
        }
        recordBotEvent({
          event: "created",
          botType: data?.botType,
          botId: bitpartId,
          outcome: "error",
        });
        throw new Error(error.message);
      }
    }
  },
);
