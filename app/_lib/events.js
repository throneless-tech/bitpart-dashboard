import { count } from "@/app/_lib/otel";
import { logger } from "@/app/_lib/logger";

// counted and logged account, sign-up and bot events. users are identified
// by their internal id only.

export const recordAccountEvent = (event, userId) => {
  count("dashboard.account_events", { event });
  logger.info({ event, "user.id": userId }, "account event");
};

export const recordSignup = ({ email, outcome, userId }) => {
  count("dashboard.signups", { email: !!email, outcome });

  if (outcome === "ok") {
    logger.info({ "user.id": userId, has_email: !!email }, "sign-up");
  } else if (outcome !== "error") {
    // errors are logged with the error where they happen
    logger.warn({ outcome }, "sign-up refused");
  }
};

export const recordBotEvent = ({
  event,
  botType,
  outcome = "ok",
  botId,
  userId,
}) => {
  count("dashboard.bot_events", {
    event,
    "bot.type": botType ?? "unknown",
    outcome,
  });

  const fields = {
    event,
    bot_id: botId,
    "bot.type": botType,
    outcome,
    "user.id": userId,
  };

  if (outcome === "ok") {
    logger.info(fields, "bot event");
  } else {
    logger.warn(fields, "bot event failed");
  }
};
