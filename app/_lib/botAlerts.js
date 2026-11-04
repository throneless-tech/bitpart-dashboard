import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { readBotBitpart, signalChannelHealth } from "@/app/_lib/bitpart";
import { sendBotAlert } from "@/app/_lib/accountEmails";

const LEASE_NAME = "bot-alerts";

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
// cleared. "unlinked" only fires when a bot that was linked stops being linked.
export const evaluateBot = (bot, health) => {
  const alerts = [];
  const cleared = [];

  if (health.status === "linked") {
    cleared.push("unlinked");
  } else if (
    bot.lastLinkStatus === "linked" &&
    (health.status === "failing" || health.status === "unlinked")
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

const canEmail = (user) => !!user?.email && user.notifyBotIssues;

export const checkBot = async (bot, { cooldownMs }) => {
  let response;

  try {
    response = await readBotBitpart(bot.bitpartId, bot.instance);
  } catch (error) {
    // bitpart unreachable: not the owner's problem, and not worth an email
    console.error("Alert poller: ReadBot failed for bot", bot.bitpartId, error);
    return;
  }

  const health = signalChannelHealth(response);

  if (health.status === "unknown") {
    return;
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
    return;
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
      } catch (error) {
        // let it try again on a later poll instead of waiting out the cooldown
        await prisma.botAlert.deleteMany({ where: { botId: bot.id, kind } });
        console.error("Alert poller: failed to email alert", kind, error);
      }
    }
  }
};

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
        await checkBot(bot, { cooldownMs });
      } catch (error) {
        console.error("Alert poller: error checking bot", bot.bitpartId, error);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, schedule.length) }, worker),
  );

  return bots.length;
};

let started = false;

export const startBotAlertPoller = () => {
  const settings = pollerSettings();

  if (started || !settings.enabled) {
    return;
  }

  started = true;

  const run = async () => {
    try {
      // hold the lease a little longer than one run takes
      if (await acquireLease(settings.intervalMs * 2)) {
        await pollOnce(settings);
      }
    } catch (error) {
      console.error("Alert poller: run failed", error);
    } finally {
      // start the next run after this one, with jitter so instances that
      // booted together don't keep checking the lease in lockstep
      const jitter = Math.floor(Math.random() * settings.intervalMs * 0.2);
      setTimeout(run, settings.intervalMs + jitter).unref?.();
    }
  };

  setTimeout(run, Math.floor(Math.random() * settings.intervalMs)).unref?.();
};
