"use server";
import { traceAction } from "@/app/_lib/otel";
import { prisma } from "@/lib/prisma";
import { getUser } from "./getUser";
import { linkChannelBitpart } from "./createBot";
import {
  readBotBitpart,
  signalChannelHealth,
  signalChannelStatus,
  submitChallengeBitpart,
} from "@/app/_lib/bitpart";
import { bitpartInstance } from "@/app/_lib/otel";
import { errorFields, logger } from "@/app/_lib/logger";
import { recordBotEvent } from "@/app/_lib/events";

const botFields = (bot) => ({
  bot_id: bot.bitpartId,
  "bitpart.instance": bitpartInstance(bot.instance),
});

// find a bot owned by the logged in user
const getOwnedBot = async (botId, username) => {
  const user = await getUser(username);

  if (!user) {
    throw new Error("Not authorized to access this bot.");
  }

  const bot = await prisma.bot.findFirst({
    where: {
      id: botId,
      creatorId: user.id,
    },
  });

  if (!bot) {
    throw new Error("Bot not found.");
  }

  return bot;
};

// get the status of the bot's signal channel from the bitpart server
export const getBotStatus = async (botId, username) => {
  const bot = await getOwnedBot(botId, username);

  try {
    const response = await readBotBitpart(bot.bitpartId, bot.instance);
    return signalChannelStatus(response);
  } catch (error) {
    logger.warn({ ...botFields(bot), ...errorFields(error) }, "ReadBot failed");
    return "unknown";
  }
};

// whether the bot currently needs a signal captcha solved
export const getBotChallenge = async (botId, username) => {
  const bot = await getOwnedBot(botId, username);

  let health = null;
  try {
    health = signalChannelHealth(
      await readBotBitpart(bot.bitpartId, bot.instance),
    );
  } catch (error) {
    logger.warn({ ...botFields(bot), ...errorFields(error) }, "ReadBot failed");
  }

  return {
    botName: bot.botName,
    required: health
      ? health.sendStatus === "challenge_required"
      : bot.lastSendStatus === "challenge_required",
    reachable: !!health,
  };
};

// signal captcha results look like signalcaptcha://<token>
const CAPTCHA_PATTERN = /^signalcaptcha:\/\/\S+$/;

export const submitBotChallenge = traceAction(
  "action.submitBotChallenge",
  async (prevState, formData) => {
    const captcha = formData.get("captcha")?.trim();

    if (!captcha || !CAPTCHA_PATTERN.test(captcha)) {
      return {
        error:
          'Paste the whole link from the "Open Signal" button. It starts with signalcaptcha://',
      };
    }

    let bot;
    try {
      bot = await getOwnedBot(formData.get("botId"), formData.get("username"));
    } catch (error) {
      return { error: error.message };
    }

    try {
      const response = await submitChallengeBitpart(bot.instance, {
        botId: bot.bitpartId,
        captcha,
      });

      if (response?.message_type === "Error") {
        recordBotEvent({
          event: "challenge_submitted",
          botType: bot.botType,
          botId: bot.bitpartId,
          outcome: "rejected",
        });
        return {
          error: `Signal didn't accept that captcha: ${response.data?.response ?? "unknown error"}. Solve a new one and try again.`,
        };
      }
    } catch (error) {
      logger.error(
        { ...botFields(bot), ...errorFields(error) },
        "SubmitChallenge failed",
      );
      recordBotEvent({
        event: "challenge_submitted",
        botType: bot.botType,
        botId: bot.bitpartId,
        outcome: "error",
      });
      return {
        error:
          "We couldn't reach the Bitpart server. Please try again in a few minutes.",
      };
    }

    await prisma.bot.update({
      where: { id: bot.id, creatorId: bot.creatorId },
      data: { challengeToken: null },
    });
    recordBotEvent({
      event: "challenge_submitted",
      botType: bot.botType,
      botId: bot.bitpartId,
    });

    return {
      success:
        "Captcha submitted. Your bot should be able to send messages again shortly.",
    };
  },
);

// send a new LinkChannel, which replaces the bot's existing signal channel
export const relinkBot = traceAction(
  "action.relinkBot",
  async (botId, username) => {
    const bot = await getOwnedBot(botId, username);

    const channelLink = await linkChannelBitpart(
      bot.bitpartId,
      bot.instance,
      bot.botName,
    );

    if (channelLink?.message_type === "Error") {
      recordBotEvent({
        event: "relinked",
        botType: bot.botType,
        botId: bot.bitpartId,
        outcome: "error",
      });
      throw new Error(channelLink.data.response);
    }

    const qrLink = channelLink.data.response;

    await prisma.bot.update({
      where: {
        id: bot.id,
        creatorId: bot.creatorId,
      },
      data: {
        qrLink,
      },
    });

    recordBotEvent({
      event: "relinked",
      botType: bot.botType,
      botId: bot.bitpartId,
    });
    return { qr: qrLink };
  },
);
