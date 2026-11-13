import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { readBotBitpart, signalChannelHealth } from "@/app/_lib/bitpart";
import { sendBotAlert } from "@/app/_lib/accountEmails";
import { realEmail } from "@/app/_lib/placeholderEmail";
import {
  bitpartInstance,
  count,
  recordDuration,
  withSpan,
} from "@/app/_lib/otel";
import { errorFields, logger } from "@/app/_lib/logger";

const LEASE_NAME = "bot-alerts";

// until when this replica holds the lease, as far as it knows
let leaseHeldUntil = 0;

// whether this replica holds the poller lease (it reports the database
// gauges, see app/_lib/dbGauges.js)
export const holdsPollerLease = (now = Date.now()) => now < leaseHeldUntil;

// for tests
export const setLeaseHeldUntil = (time) => {
  leaseHeldUntil = time;
};

// what the poller last saw for each bot: linked, unlinked, failing, or
// unknown when bitpart couldn't tell it. in memory only.
const lastStatuses = new Map();

export const linkStatuses = () => [...lastStatuses.values()];

const rememberStatus = (bot, status) =>
  lastStatuses.set(bot.id, { status, instance: bot.instance });

const numberEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const pollerSettings = () => ({
  enabled: process.env.BOT_ALERT_POLLING_ENABLED !== "false",
  intervalMs: numberEnv("BOT_ALERT_POLL_SECONDS", 300) * 1000,
  cooldownMs: numberEnv("BOT_ALERT_COOLDOWN_HOURS", 6) * 60 * 60 * 1000,
  concurrency: numberEnv("BOT_ALERT_CONCURRENCY", 5),
});

// identifies this process when holding the poller lease
const instanceId = `${process.pid}-${crypto.randomBytes(6).toString("hex")}`;

// take or renew the poller lease. only one instance holds it at a time; a
// lease that has expired (e.g. its instance crashed) can be taken over.
export const acquireLease = async (ttlMs, holder = instanceId) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);

  const { count } = await prisma.pollerLease.updateMany({
    where: {
      name: LEASE_NAME,
      OR: [{ holder }, { expiresAt: { lt: now } }],
    },
    data: { holder, expiresAt },
  });

  if (count === 1) {
    return true;
  }

  try {
    await prisma.pollerLease.create({
      data: { name: LEASE_NAME, holder, expiresAt },
    });
    return true;
  } catch (error) {
    // another instance holds it, or created it first
    if (error.code === "P2002") {
      return false;
    }
    throw error;
  }
};

// which alert kinds apply to a bot right now, and which past problems have
// cleared. "unlinked" only fires when a bot that was linked stops being linked;
// a failing bot alerts even if it was never seen linked.
export const evaluateBot = (bot, health) => {
  const alerts = [];
  const cleared = [];

  if (health.status === "linked") {
    cleared.push("unlinked");
  } else if (
    (health.status === "failing" && bot.lastLinkStatus !== "failing") ||
    (health.status === "unlinked" && bot.lastLinkStatus === "linked")
  ) {
    alerts.push("unlinked");
  }

  if (health.sendStatus === "ok") {
    cleared.push("failed", "challenge_required", "rate_limited");
  } else if (health.sendStatus) {
    alerts.push(health.sendStatus);
    cleared.push(
      ...["failed", "challenge_required", "rate_limited"].filter(
        (k) => k !== health.sendStatus,
      ),
    );
  }

  return { alerts, cleared };
};

// claim the right to send an alert kind for a bot: true at most once per
// cooldown period, even with several instances racing.
export const claimAlert = async (botId, kind, cooldownMs) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - cooldownMs);

  const { count } = await prisma.botAlert.updateMany({
    where: { botId, kind, lastSentAt: { lt: cutoff } },
    data: { lastSentAt: now },
  });

  if (count === 1) {
    return true;
  }

  try {
    await prisma.botAlert.create({ data: { botId, kind, lastSentAt: now } });
    return true;
  } catch (error) {
    // already alerted within the cooldown
    if (error.code === "P2002") {
      return false;
    }
    throw error;
  }
};

const canEmail = (user) => !!realEmail(user) && user.notifyBotIssues;

export const checkBot = async (bot, { cooldownMs }) => {
  let response;

  try {
    response = await readBotBitpart(bot.bitpartId, bot.instance);
  } catch (error) {
    // bitpart unreachable: not the owner's problem, and not worth an email
    logger.warn(
      {
        bot_id: bot.bitpartId,
        "bitpart.instance": bitpartInstance(bot.instance),
        ...errorFields(error),
      },
      "alert poller: ReadBot failed",
    );
    rememberStatus(bot, "unknown");
    return "unknown";
  }

  const health = signalChannelHealth(response);

  rememberStatus(bot, health.status);

  if (health.status === "unknown") {
    return "unknown";
  }

  const { alerts, cleared } = evaluateBot(bot, health);

  const status = {
    lastLinkStatus: health.status,
    lastSendStatus: health.sendStatus,
    challengeToken: health.challengeToken,
  };

  if (
    Object.entries(status).some(([k, v]) => (bot[k] ?? null) !== (v ?? null))
  ) {
    await prisma.bot.update({ where: { id: bot.id }, data: status });
  }

  // a cleared problem resets its cooldown, so the next incident alerts at once
  if (cleared.length) {
    await prisma.botAlert.deleteMany({
      where: { botId: bot.id, kind: { in: cleared } },
    });
  }

  if (!canEmail(bot.creator)) {
    for (const kind of alerts) {
      count("dashboard.alerts", { kind, outcome: "skipped" });
    }
    return health.status;
  }

  for (const kind of alerts) {
    if (await claimAlert(bot.id, kind, cooldownMs)) {
      try {
        await sendBotAlert({
          user: bot.creator,
          bot,
          kind,
          retryAt: health.retryAt,
        });
        count("dashboard.alerts", { kind, outcome: "sent" });
        logger.info({ bot_id: bot.bitpartId, kind }, "bot alert sent");
      } catch (error) {
        // let it try again on a later poll instead of waiting out the cooldown
        await prisma.botAlert.deleteMany({ where: { botId: bot.id, kind } });
        count("dashboard.alerts", { kind, outcome: "failed" });
        logger.warn(
          { bot_id: bot.bitpartId, kind, ...errorFields(error) },
          "alert poller: failed to email alert",
        );
      }
    } else {
      count("dashboard.alerts", { kind, outcome: "cooldown" });
    }
  }

  return health.status;
};

// checkBot in its own span
const checkBotTraced = (bot, options) =>
  withSpan(
    "poller.check_bot",
    {
      bot_id: bot.bitpartId,
      "bitpart.instance": bitpartInstance(bot.instance),
    },
    async (span) => {
      const result = await checkBot(bot, options);
      span.setAttribute("result", result ?? "unknown");
      logger.debug(
        {
          bot_id: bot.bitpartId,
          "bitpart.instance": bitpartInstance(bot.instance),
          result,
        },
        "alert poller: checked bot",
      );
      return result;
    },
  );

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// check every bot once, spread across the interval at random offsets so
// bitpart sees a steady trickle instead of a burst, with at most
// `concurrency` checks in flight.
export const pollOnce = async (
  { intervalMs, cooldownMs, concurrency },
  { random = Math.random, wait = sleep } = {},
) => {
  const bots = await prisma.bot.findMany({
    select: {
      id: true,
      bitpartId: true,
      instance: true,
      botName: true,
      lastLinkStatus: true,
      lastSendStatus: true,
      challengeToken: true,
      creator: {
        select: { username: true, email: true, notifyBotIssues: true },
      },
    },
  });

  // spread over 90% of the interval so a run finishes before the next starts
  const schedule = bots
    .map((bot) => ({ bot, at: Math.floor(random() * intervalMs * 0.9) }))
    .sort((a, b) => a.at - b.at);

  const started = Date.now();
  let next = 0;

  const worker = async () => {
    while (next < schedule.length) {
      const { bot, at } = schedule[next++];
      const delay = at - (Date.now() - started);

      if (delay > 0) {
        await wait(delay);
      }

      try {
        await checkBotTraced(bot, { cooldownMs });
      } catch (error) {
        logger.error(
          { bot_id: bot.bitpartId, ...errorFields(error) },
          "alert poller: error checking bot",
        );
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, schedule.length) }, worker),
  );

  // forget deleted bots
  const ids = new Set(bots.map((bot) => bot.id));
  for (const id of lastStatuses.keys()) {
    if (!ids.has(id)) lastStatuses.delete(id);
  }

  return bots.length;
};

// one poller run, traced and measured
const pollRun = (settings) =>
  withSpan("poller.run", {}, async (span) => {
    const started = performance.now();
    let outcome = "ok";

    try {
      span.setAttribute("bots", await pollOnce(settings));
    } catch (error) {
      outcome = "error";
      throw error;
    } finally {
      count("dashboard.poller.runs", { outcome });
      recordDuration(
        "dashboard.poller.run.duration",
        (performance.now() - started) / 1000,
        { outcome },
      );
    }
  });

let started = false;

export const startBotAlertPoller = () => {
  const settings = pollerSettings();

  if (started || !settings.enabled) {
    return;
  }

  started = true;
  logger.info({ interval_ms: settings.intervalMs }, "alert poller started");

  const run = async () => {
    try {
      // hold the lease a little longer than one run takes
      const ttlMs = settings.intervalMs * 2;
      const held = holdsPollerLease();
      const acquired = await acquireLease(ttlMs);

      leaseHeldUntil = acquired ? Date.now() + ttlMs : 0;

      if (acquired !== held) {
        logger.info(
          { holder: acquired },
          acquired ? "alert poller lease taken" : "alert poller lease lost",
        );
      }

      if (acquired) {
        await pollRun(settings);
      }
    } catch (error) {
      logger.error(errorFields(error), "alert poller: run failed");
    } finally {
      // start the next run after this one, with jitter so instances that
      // booted together don't keep checking the lease in lockstep
      const jitter = Math.floor(Math.random() * settings.intervalMs * 0.2);
      setTimeout(run, settings.intervalMs + jitter).unref?.();
    }
  };

  setTimeout(run, Math.floor(Math.random() * settings.intervalMs)).unref?.();
};
