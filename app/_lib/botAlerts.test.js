import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// small in-memory stand-ins for the tables the poller uses
const mocks = vi.hoisted(() => {
  const db = { bots: [], alerts: [], leases: [] };
  const fieldMatches = (value, cond) => {
    if (cond && typeof cond === "object" && !(cond instanceof Date)) {
      if ("lt" in cond) return value < cond.lt;
      if ("in" in cond) return cond.in.includes(value);
    }
    return value === cond;
  };
  const matches = (row, where) =>
    Object.entries(where).every(([k, v]) =>
      k === "OR" ? v.some((w) => matches(row, w)) : fieldMatches(row[k], v),
    );
  const unique = (table, row, keys) => {
    if (table.some((r) => keys.every((k) => r[k] === row[k]))) {
      throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
    }
  };
  const updateMany = (table) =>
    vi.fn(async ({ where, data }) => {
      const rows = table().filter((r) => matches(r, where));
      rows.forEach((r) => Object.assign(r, data));
      return { count: rows.length };
    });
  const deleteMany = (name) =>
    vi.fn(async ({ where }) => {
      const before = db[name].length;
      db[name] = db[name].filter((r) => !matches(r, where));
      return { count: before - db[name].length };
    });

  return {
    db,
    readBotBitpart: vi.fn(),
    sendBotAlert: vi.fn(),
    prisma: {
      bot: {
        findMany: vi.fn(async () => db.bots),
        update: vi.fn(async ({ where, data }) => {
          const bot = db.bots.find((b) => b.id === where.id);
          Object.assign(bot, data);
          return bot;
        }),
      },
      botAlert: {
        updateMany: updateMany(() => db.alerts),
        create: vi.fn(async ({ data }) => {
          unique(db.alerts, data, ["botId", "kind"]);
          db.alerts.push({ ...data });
        }),
        deleteMany: deleteMany("alerts"),
      },
      pollerLease: {
        updateMany: updateMany(() => db.leases),
        create: vi.fn(async ({ data }) => {
          unique(db.leases, data, ["name"]);
          db.leases.push({ ...data });
        }),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/app/_lib/accountEmails", () => ({
  sendBotAlert: mocks.sendBotAlert,
}));
vi.mock("@/app/_lib/bitpart", async (importOriginal) => ({
  ...(await importOriginal()),
  readBotBitpart: mocks.readBotBitpart,
}));

import {
  acquireLease,
  checkBot,
  claimAlert,
  evaluateBot,
  pollOnce,
} from "./botAlerts";

const HOUR = 60 * 60 * 1000;
const COOLDOWN = 6 * HOUR;

const owner = {
  username: "alice",
  email: "alice@mail.org",
  notifyBotIssues: true,
};

const readBot = (channel) => ({
  message_type: "Response",
  data: {
    response_type: "ReadBot",
    response: {
      channels: [{ channel_id: "signal", status: "linked", ...channel }],
    },
  },
});

const newBot = (overrides = {}) => ({
  id: "row-1",
  bitpartId: "bot-1",
  instance: "bp:5000",
  botName: "Acme",
  lastLinkStatus: "linked",
  creator: { ...owner },
  ...overrides,
});

const kindsSent = () => mocks.sendBotAlert.mock.calls.map(([a]) => a.kind);

beforeEach(() => {
  mocks.db.bots = [];
  mocks.db.alerts = [];
  mocks.db.leases = [];
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-29T12:00:00Z"));
  mocks.sendBotAlert.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("evaluateBot", () => {
  const health = (h) => ({ status: "linked", sendStatus: "ok", ...h });

  it("alerts when a linked bot becomes unlinked or failing", () => {
    expect(
      evaluateBot({ lastLinkStatus: "linked" }, health({ status: "unlinked" }))
        .alerts,
    ).toEqual(["unlinked"]);
    expect(
      evaluateBot({ lastLinkStatus: "linked" }, health({ status: "failing" }))
        .alerts,
    ).toEqual(["unlinked"]);
  });

  it("doesn't alert for a bot that was never linked", () => {
    expect(
      evaluateBot({ lastLinkStatus: null }, health({ status: "unlinked" }))
        .alerts,
    ).toEqual([]);
  });

  it("alerts for each negative send status", () => {
    ["failed", "challenge_required", "rate_limited"].forEach((sendStatus) => {
      expect(evaluateBot({}, health({ sendStatus })).alerts).toEqual([
        sendStatus,
      ]);
    });
  });

  it("clears every send problem once sending is ok again", () => {
    expect(evaluateBot({}, health()).cleared).toEqual(
      expect.arrayContaining([
        "unlinked",
        "failed",
        "challenge_required",
        "rate_limited",
      ]),
    );
  });
});

describe("claimAlert", () => {
  it("allows one alert per bot and kind per cooldown", async () => {
    expect(await claimAlert("row-1", "failed", COOLDOWN)).toBe(true);
    expect(await claimAlert("row-1", "failed", COOLDOWN)).toBe(false);

    vi.advanceTimersByTime(COOLDOWN + 1);
    expect(await claimAlert("row-1", "failed", COOLDOWN)).toBe(true);
  });

  it("tracks kinds and bots separately", async () => {
    await claimAlert("row-1", "failed", COOLDOWN);

    expect(await claimAlert("row-1", "rate_limited", COOLDOWN)).toBe(true);
    expect(await claimAlert("row-2", "failed", COOLDOWN)).toBe(true);
  });
});

describe("acquireLease", () => {
  it("lets only one instance hold the lease until it expires", async () => {
    expect(await acquireLease(10 * 60 * 1000, "a")).toBe(true);
    expect(await acquireLease(10 * 60 * 1000, "b")).toBe(false);
    expect(await acquireLease(10 * 60 * 1000, "a")).toBe(true);

    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(await acquireLease(10 * 60 * 1000, "b")).toBe(true);
    expect(await acquireLease(10 * 60 * 1000, "a")).toBe(false);
  });
});

describe("checkBot", () => {
  const check = async (bot, channel) => {
    mocks.readBotBitpart.mockResolvedValue(readBot(channel));
    await checkBot(bot, { cooldownMs: COOLDOWN });
  };

  it("emails once for a captcha challenge and stores the token", async () => {
    const bot = newBot();
    mocks.db.bots.push(bot);

    await check(bot, {
      send_status: "challenge_required",
      challenge_token: "tok",
    });
    await check(bot, {
      send_status: "challenge_required",
      challenge_token: "tok",
    });

    expect(kindsSent()).toEqual(["challenge_required"]);
    expect(bot.challengeToken).toBe("tok");
    expect(bot.lastSendStatus).toBe("challenge_required");
  });

  it("includes retry_at in rate limit alerts", async () => {
    const bot = newBot();
    mocks.db.bots.push(bot);

    await check(bot, {
      send_status: "rate_limited",
      retry_at: "2026-10-29T15:00:00Z",
    });

    expect(mocks.sendBotAlert.mock.calls[0][0].retryAt.toISOString()).toBe(
      "2026-10-29T15:00:00.000Z",
    );
  });

  it("alerts again straight away after the problem clears", async () => {
    const bot = newBot();
    mocks.db.bots.push(bot);

    await check(bot, { send_status: "failed" });
    await check(bot, { send_status: "ok" });
    await check(bot, { send_status: "failed" });

    expect(kindsSent()).toEqual(["failed", "failed"]);
  });

  it("alerts once when the bot becomes unlinked", async () => {
    const bot = newBot();
    mocks.db.bots.push(bot);

    await check(bot, { status: "unlinked", send_status: "ok" });
    await check(bot, { status: "unlinked", send_status: "ok" });

    expect(kindsSent()).toEqual(["unlinked"]);
    expect(bot.lastLinkStatus).toBe("unlinked");
  });

  it("records status but doesn't email when notifications are off", async () => {
    const bot = newBot({ creator: { ...owner, notifyBotIssues: false } });
    mocks.db.bots.push(bot);

    await check(bot, { send_status: "failed" });

    expect(mocks.sendBotAlert).not.toHaveBeenCalled();
    expect(bot.lastSendStatus).toBe("failed");
  });

  it("doesn't email owners without an email address", async () => {
    const bot = newBot({ creator: { ...owner, email: null } });
    mocks.db.bots.push(bot);

    await check(bot, { send_status: "failed" });

    expect(mocks.sendBotAlert).not.toHaveBeenCalled();
  });

  it("doesn't email or change anything when bitpart can't be reached", async () => {
    const bot = newBot();
    mocks.db.bots.push(bot);
    mocks.readBotBitpart.mockRejectedValue(new Error("refused"));

    await checkBot(bot, { cooldownMs: COOLDOWN });

    expect(mocks.sendBotAlert).not.toHaveBeenCalled();
    expect(bot.lastLinkStatus).toBe("linked");
  });

  it("retries an alert on the next poll if the email fails", async () => {
    const bot = newBot();
    mocks.db.bots.push(bot);
    mocks.sendBotAlert.mockRejectedValueOnce(new Error("smtp down"));

    await check(bot, { send_status: "failed" });
    await check(bot, { send_status: "failed" });

    expect(mocks.sendBotAlert).toHaveBeenCalledTimes(2);
  });
});

describe("pollOnce", () => {
  it("checks every bot once, at random offsets within the interval", async () => {
    mocks.db.bots.push(
      newBot({ id: "a", bitpartId: "bot-a" }),
      newBot({ id: "b", bitpartId: "bot-b" }),
      newBot({ id: "c", bitpartId: "bot-c" }),
    );
    mocks.readBotBitpart.mockResolvedValue(readBot({ send_status: "ok" }));
    const offsets = [0.5, 0.1, 0.9];
    const waits = [];

    const count = await pollOnce(
      { intervalMs: 1000, cooldownMs: COOLDOWN, concurrency: 1 },
      {
        random: () => offsets.shift(),
        wait: async (ms) => {
          waits.push(ms);
          vi.advanceTimersByTime(ms);
        },
      },
    );

    expect(count).toBe(3);
    expect(mocks.readBotBitpart.mock.calls.map(([id]) => id)).toEqual([
      "bot-b",
      "bot-a",
      "bot-c",
    ]);
    // offsets 90, 450 and 810ms (within 90% of the 1000ms interval)
    expect(waits).toEqual([90, 360, 360]);
  });

  it("keeps going when one bot fails", async () => {
    mocks.db.bots.push(
      newBot({ id: "a", bitpartId: "bot-a" }),
      newBot({ id: "b", bitpartId: "bot-b" }),
    );
    mocks.prisma.bot.update.mockRejectedValueOnce(new Error("db hiccup"));
    mocks.readBotBitpart.mockResolvedValue(readBot({ send_status: "ok" }));

    await pollOnce(
      { intervalMs: 1000, cooldownMs: COOLDOWN, concurrency: 2 },
      { random: () => 0, wait: async () => {} },
    );

    expect(mocks.readBotBitpart).toHaveBeenCalledTimes(2);
  });
});
