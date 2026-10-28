import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// a tiny in-memory stand-in for the VerificationToken table
const mocks = vi.hoisted(() => {
  const rows = [];
  const matches = (row, where) =>
    Object.entries(where).every(([k, v]) => row[k] === v);

  return {
    rows,
    prisma: {
      verificationToken: {
        findFirst: vi.fn(async ({ where }) => {
          const found = rows
            .filter((r) => matches(r, where))
            .sort((a, b) => b.expires - a.expires);
          return found[0] ?? null;
        }),
        deleteMany: vi.fn(async ({ where }) => {
          let count = 0;
          for (let i = rows.length - 1; i >= 0; i--) {
            if (matches(rows[i], where)) {
              rows.splice(i, 1);
              count++;
            }
          }
          return { count };
        }),
        create: vi.fn(async ({ data }) => {
          rows.push({ ...data });
          return data;
        }),
      },
      $transaction: vi.fn(async (ops) => {
        for (const op of ops) await op;
      }),
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import {
  TOKEN_THROTTLE,
  TOKEN_TTL,
  clearTokens,
  consumeToken,
  createToken,
} from "./tokens";

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

beforeEach(() => {
  mocks.rows.length = 0;
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-24T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("createToken", () => {
  it("stores only a hash of the token, with the purpose's expiry", async () => {
    const raw = await createToken("reset-password", "user-1");

    expect(raw).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(mocks.rows).toHaveLength(1);
    expect(mocks.rows[0].identifier).toBe("reset-password:user-1");
    expect(mocks.rows[0].token).toBe(sha256(raw));
    expect(mocks.rows[0].token).not.toContain(raw);
    expect(mocks.rows[0].expires.getTime()).toBe(
      Date.now() + TOKEN_TTL["reset-password"],
    );
  });

  it("replaces an older token for the same purpose and user", async () => {
    const first = await createToken("verify-email", "user-1");
    vi.advanceTimersByTime(TOKEN_THROTTLE + 1);
    const second = await createToken("verify-email", "user-1");

    expect(mocks.rows).toHaveLength(1);
    expect(await consumeToken("verify-email", first)).toBeNull();
    expect(await consumeToken("verify-email", second)).toBe("user-1");
  });

  it("refuses to issue another token within the throttle window", async () => {
    await createToken("reset-password", "user-1");
    vi.advanceTimersByTime(TOKEN_THROTTLE - 1000);

    expect(await createToken("reset-password", "user-1")).toBeNull();
  });

  it("keeps tokens for different purposes and users separate", async () => {
    await createToken("reset-password", "user-1");
    await createToken("verify-email", "user-1");
    await createToken("reset-password", "user-2");

    expect(mocks.rows).toHaveLength(3);
  });

  it("rejects an unknown purpose", async () => {
    await expect(createToken("nope", "user-1")).rejects.toThrow(
      "Unknown token purpose",
    );
  });
});

describe("consumeToken", () => {
  it("returns the user id once, then null", async () => {
    const raw = await createToken("reset-password", "user-1");

    expect(await consumeToken("reset-password", raw)).toBe("user-1");
    expect(await consumeToken("reset-password", raw)).toBeNull();
  });

  it("rejects an expired token and deletes it", async () => {
    const raw = await createToken("reset-password", "user-1");
    vi.advanceTimersByTime(TOKEN_TTL["reset-password"] + 1);

    expect(await consumeToken("reset-password", raw)).toBeNull();
    expect(mocks.rows).toHaveLength(0);
  });

  it("rejects a token issued for a different purpose", async () => {
    const raw = await createToken("verify-email", "user-1");

    expect(await consumeToken("reset-password", raw)).toBeNull();
  });

  it("rejects unknown and malformed tokens", async () => {
    expect(await consumeToken("reset-password", "not-a-token")).toBeNull();
    expect(await consumeToken("reset-password", "")).toBeNull();
    expect(await consumeToken("reset-password", undefined)).toBeNull();
  });
});

describe("clearTokens", () => {
  it("removes outstanding tokens for one purpose and user only", async () => {
    await createToken("reset-password", "user-1");
    await createToken("verify-email", "user-1");

    await clearTokens("reset-password", "user-1");

    expect(mocks.rows.map((r) => r.identifier)).toEqual([
      "verify-email:user-1",
    ]);
  });
});
