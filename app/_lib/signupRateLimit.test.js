import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// a tiny in-memory stand-in for the SignupAttempt table
const mocks = vi.hoisted(() => {
  const rows = [];
  const matches = (row, where) =>
    Object.entries(where).every(([k, v]) => {
      if (v && typeof v === "object" && "lt" in v) return row[k] < v.lt;
      if (v && typeof v === "object" && "gte" in v) return row[k] >= v.gte;
      return row[k] === v;
    });

  return {
    rows,
    prisma: {
      signupAttempt: {
        count: vi.fn(
          async ({ where }) => rows.filter((r) => matches(r, where)).length,
        ),
        create: vi.fn(async ({ data }) => {
          rows.push({ ...data, createdAt: new Date() });
        }),
        deleteMany: vi.fn(async ({ where }) => {
          for (let i = rows.length - 1; i >= 0; i--) {
            if (matches(rows[i], where)) rows.splice(i, 1);
          }
        }),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import { clientIp, recordSignup, signupAllowed } from "./signupRateLimit";

const xff = (value) =>
  new Headers(value === undefined ? {} : { "x-forwarded-for": value });

beforeEach(() => {
  mocks.rows.length = 0;
  vi.stubEnv("AUTH_SECRET", "test-secret");
  vi.stubEnv("SIGNUP_RATE_LIMIT_MAX", "");
  vi.stubEnv("SIGNUP_RATE_LIMIT_WINDOW_MINUTES", "");
  vi.stubEnv("TRUSTED_PROXY_HOPS", "");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-25T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("clientIp", () => {
  it("uses the address the proxy appended, ignoring spoofed entries", () => {
    expect(clientIp(xff("203.0.113.7"))).toBe("203.0.113.7");
    expect(clientIp(xff("1.2.3.4, 203.0.113.7"))).toBe("203.0.113.7");
  });

  it("counts back by the number of trusted proxies", () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");

    expect(clientIp(xff("203.0.113.7, 10.0.0.2"))).toBe("203.0.113.7");
    expect(clientIp(xff("1.2.3.4, 203.0.113.7, 10.0.0.2"))).toBe("203.0.113.7");
  });

  it("returns null when there are fewer entries than trusted proxies", () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");

    expect(clientIp(xff("203.0.113.7"))).toBeNull();
    expect(clientIp(xff(undefined))).toBeNull();
  });
});

describe("signupAllowed", () => {
  it("allows up to the default of 5 sign-ups per IP per hour", async () => {
    for (let i = 0; i < 5; i++) {
      expect(await signupAllowed("203.0.113.7")).toBe(true);
      await recordSignup("203.0.113.7");
    }

    expect(await signupAllowed("203.0.113.7")).toBe(false);
  });

  it("counts each IP separately", async () => {
    vi.stubEnv("SIGNUP_RATE_LIMIT_MAX", "1");
    await recordSignup("203.0.113.7");

    expect(await signupAllowed("203.0.113.7")).toBe(false);
    expect(await signupAllowed("198.51.100.9")).toBe(true);
  });

  it("allows sign-ups again once the window has passed, and prunes old rows", async () => {
    vi.stubEnv("SIGNUP_RATE_LIMIT_MAX", "1");
    vi.stubEnv("SIGNUP_RATE_LIMIT_WINDOW_MINUTES", "10");
    await recordSignup("203.0.113.7");

    vi.advanceTimersByTime(10 * 60 * 1000 + 1);

    expect(await signupAllowed("203.0.113.7")).toBe(true);
    expect(mocks.rows).toHaveLength(0);
  });

  it("stores a keyed hash, not the IP address", async () => {
    await recordSignup("203.0.113.7");

    const expected = crypto
      .createHmac("sha256", "test-secret")
      .update("203.0.113.7")
      .digest("hex");
    expect(mocks.rows[0].ipHash).toBe(expected);
    expect(JSON.stringify(mocks.rows)).not.toContain("203.0.113.7");
  });

  it("puts requests with no known IP in one shared bucket", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("SIGNUP_RATE_LIMIT_MAX", "1");
    await recordSignup(null);

    expect(await signupAllowed(null)).toBe(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it("throws when AUTH_SECRET is not configured", async () => {
    vi.stubEnv("AUTH_SECRET", "");

    await expect(recordSignup("203.0.113.7")).rejects.toThrow(
      "AUTH_SECRET is not configured.",
    );
  });
});
