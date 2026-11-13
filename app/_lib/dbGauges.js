import { prisma } from "@/lib/prisma";
import { canUseEmailCodes } from "@/app/_lib/mfa";
import { realEmail } from "@/app/_lib/placeholderEmail";
import { bitpartInstance, meter } from "@/app/_lib/otel";
import { holdsPollerLease, linkStatuses } from "@/app/_lib/botAlerts";
import { errorFields, logger } from "@/app/_lib/logger";

// gauges counted from the database. every replica could count them, but
// only the one holding the bot alert poller lease reports them, so totals
// aren't doubled. counts are refreshed in the background and the gauges
// report the latest ones.

export const REFRESH_MS = 60 * 1000;

const emailBucket = (user) =>
  !realEmail(user) ? "none" : user.emailVerified ? "confirmed" : "unconfirmed";

// the same rules as loginMethods() in app/_lib/mfa.js
const mfaBucket = (user) => {
  const totp = !!user.twoFactor?.verified;
  const email = !!user.emailOtpEnabled && canUseEmailCodes(user);

  return totp && email ? "both" : totp ? "totp" : email ? "email" : "none";
};

// [attributes, count] for each combination that exists
const tally = (rows, attributesOf) => {
  const counts = new Map();

  for (const row of rows) {
    const attributes = attributesOf(row);
    const key = JSON.stringify(attributes);
    const entry = counts.get(key) ?? [attributes, 0];
    entry[1] += row._n ?? 1;
    counts.set(key, entry);
  }

  return [...counts.values()];
};

export const userBuckets = (users) =>
  tally(users, (user) => ({
    email: emailBucket(user),
    mfa: mfaBucket(user),
    passkey: String((user._count?.passkeys ?? 0) > 0),
  }));

export const botBuckets = (groups) =>
  tally(
    groups.map((g) => ({ ...g, _n: g._count?._all ?? 0 })),
    (g) => ({
      "bot.type": g.botType,
      "bitpart.instance": bitpartInstance(g.instance),
    }),
  );

export const linkStatusBuckets = (statuses) =>
  tally(statuses, (s) => ({
    status: s.status,
    "bitpart.instance": bitpartInstance(s.instance),
  }));

let latest = { users: [], bots: [] };

export const refreshCounts = async () => {
  const [users, bots] = await Promise.all([
    prisma.user.findMany({
      select: {
        email: true,
        emailVerified: true,
        emailOtpEnabled: true,
        twoFactor: { select: { verified: true } },
        _count: { select: { passkeys: true } },
      },
    }),
    prisma.bot.groupBy({
      by: ["botType", "instance"],
      _count: { _all: true },
    }),
  ]);

  latest = { users: userBuckets(users), bots: botBuckets(bots) };
};

// what each gauge reports now: nothing unless this replica holds the lease
export const gaugeValues = () =>
  holdsPollerLease()
    ? {
        users: latest.users,
        bots: latest.bots,
        linkStatus: linkStatusBuckets(linkStatuses()),
      }
    : { users: [], bots: [], linkStatus: [] };

const observeEach = (rows) => (result) => {
  for (const [attributes, value] of rows()) {
    result.observe(value, attributes);
  }
};

export const startDbGauges = () => {
  const m = meter();

  m.createObservableGauge("dashboard.users", {
    description: "Users by email, two-factor and passkey state",
  }).addCallback(observeEach(() => gaugeValues().users));
  m.createObservableGauge("dashboard.bots", {
    description: "Bots by type and bitpart instance",
  }).addCallback(observeEach(() => gaugeValues().bots));
  m.createObservableGauge("dashboard.bot_link_status", {
    description: "Bots by the link status the alert poller last saw",
  }).addCallback(observeEach(() => gaugeValues().linkStatus));

  const refresh = async () => {
    if (!holdsPollerLease()) {
      return;
    }

    try {
      await refreshCounts();
    } catch (error) {
      logger.error(errorFields(error), "failed to count users and bots");
    }
  };

  refresh();
  setInterval(refresh, REFRESH_MS).unref?.();
};
