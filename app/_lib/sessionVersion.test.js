import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUnique } },
}));

import { checkSessionVersion } from "./sessionVersion";

beforeEach(() => {
  mocks.findUnique.mockResolvedValue({ sessionVersion: 2 });
});

afterEach(() => {
  delete globalThis.EdgeRuntime;
  vi.clearAllMocks();
});

describe("checkSessionVersion", () => {
  it("records the user's sessionVersion at sign-in", async () => {
    const token = await checkSessionVersion({
      token: { sub: "user-1" },
      user: { id: "user-1", sessionVersion: 2 },
    });

    expect(token.sessionVersion).toBe(2);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("keeps the session while the version matches", async () => {
    const token = { sub: "user-1", sessionVersion: 2 };

    expect(await checkSessionVersion({ token })).toBe(token);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { sessionVersion: true },
    });
  });

  it("ends the session after a password change or reset", async () => {
    mocks.findUnique.mockResolvedValue({ sessionVersion: 3 });

    expect(
      await checkSessionVersion({
        token: { sub: "user-1", sessionVersion: 2 },
      }),
    ).toBeNull();
  });

  it("ends sessions from before this check existed once the version moves on", async () => {
    mocks.findUnique.mockResolvedValue({ sessionVersion: 1 });

    expect(await checkSessionVersion({ token: { sub: "user-1" } })).toBeNull();
  });

  it("ends the session if the user no longer exists", async () => {
    mocks.findUnique.mockResolvedValue(null);

    expect(
      await checkSessionVersion({
        token: { sub: "user-1", sessionVersion: 2 },
      }),
    ).toBeNull();
  });

  it("skips the database in the edge runtime", async () => {
    globalThis.EdgeRuntime = "edge-runtime";
    mocks.findUnique.mockResolvedValue({ sessionVersion: 3 });
    const token = { sub: "user-1", sessionVersion: 2 };

    expect(await checkSessionVersion({ token })).toBe(token);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });
});
