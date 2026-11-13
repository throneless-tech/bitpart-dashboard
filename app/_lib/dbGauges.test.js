import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { setUpTestTelemetry } from "./otel.testing";

const mocks = vi.hoisted(() => ({
  users: [],
  bots: [],
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn(async () => mocks.users) },
    bot: { groupBy: vi.fn(async () => mocks.bots) },
  },
}));
vi.mock("@/app/_lib/accountEmails", () => ({ sendBotAlert: vi.fn() }));

import { setLeaseHeldUntil } from "./botAlerts";
import {
  botBuckets,
  gaugeValues,
  refreshCounts,
  startDbGauges,
  userBuckets,
} from "./dbGauges";

const PLACEHOLDER = "0b6e6f2e-7c4e-4a43-9d0f-2f7f3b1d9b11@no-email.invalid";

const user = (fields) => ({
  email: "a@mail.org",
  emailVerified: true,
  emailOtpEnabled: false,
  twoFactor: null,
  _count: { passkeys: 0 },
  ...fields,
});

const USERS = [
  user({ email: PLACEHOLDER, emailVerified: false }),
  user({ email: PLACEHOLDER, emailVerified: true }),
  user({ emailVerified: false }),
  user({ twoFactor: { verified: true } }),
  user({ twoFactor: { verified: false }, emailOtpEnabled: true }),
  user({
    twoFactor: { verified: true },
    emailOtpEnabled: true,
    _count: { passkeys: 2 },
  }),
  // email codes only count with a real, confirmed address
  user({ email: PLACEHOLDER, emailOtpEnabled: true }),
];

afterEach(() => {
  setLeaseHeldUntil(0);
});

describe("userBuckets", () => {
  it("counts users by email, two-factor and passkey state", () => {
    expect(userBuckets(USERS)).toEqual([
      [{ email: "none", mfa: "none", passkey: "false" }, 3],
      [{ email: "unconfirmed", mfa: "none", passkey: "false" }, 1],
      [{ email: "confirmed", mfa: "totp", passkey: "false" }, 1],
      [{ email: "confirmed", mfa: "email", passkey: "false" }, 1],
      [{ email: "confirmed", mfa: "both", passkey: "true" }, 1],
    ]);
  });
});

describe("botBuckets", () => {
  it("counts bots by type and bitpart instance", () => {
    expect(
      botBuckets([
        {
          botType: "esim",
          instance: "bitpart-0.bitpart:3000",
          _count: { _all: 2 },
        },
        {
          botType: "esim",
          instance: "bitpart-0.bitpart.svc:3000",
          _count: { _all: 1 },
        },
        {
          botType: "vpn",
          instance: "bitpart-1.bitpart:3000",
          _count: { _all: 4 },
        },
      ]),
    ).toEqual([
      [{ "bot.type": "esim", "bitpart.instance": "bitpart-0" }, 3],
      [{ "bot.type": "vpn", "bitpart.instance": "bitpart-1" }, 4],
    ]);
  });
});

describe("lease-holder gauges", () => {
  let telemetry;

  beforeAll(() => {
    telemetry = setUpTestTelemetry();
    mocks.users = USERS;
    mocks.bots = [
      {
        botType: "esim",
        instance: "bitpart-0.bitpart:3000",
        _count: { _all: 2 },
      },
    ];
  });

  it("are only reported by the replica holding the poller lease", async () => {
    await refreshCounts();
    startDbGauges();

    expect(gaugeValues()).toEqual({ users: [], bots: [], linkStatus: [] });
    let collected = await telemetry.collect();
    expect(collected["dashboard.users"] ?? []).toEqual([]);

    setLeaseHeldUntil(Date.now() + 60_000);

    collected = await telemetry.collect();
    expect(collected["dashboard.users"]).toHaveLength(5);
    expect(collected["dashboard.users"][0]).toEqual({
      attributes: { email: "none", mfa: "none", passkey: "false" },
      value: 3,
    });
    expect(collected["dashboard.bots"]).toEqual([
      {
        attributes: { "bot.type": "esim", "bitpart.instance": "bitpart-0" },
        value: 2,
      },
    ]);
  });
});
