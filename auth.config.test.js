import bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findFirst: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findFirst: mocks.findFirst } },
}));

import authConfig from "./auth.config";

const authorize = (credentials) =>
  authConfig.providers[0].options.authorize(credentials);

beforeEach(async () => {
  // an account created before the 15 character minimum
  mocks.findFirst.mockResolvedValue({
    id: "user-1",
    username: "alice",
    password: await bcrypt.hash("short123", 4),
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("credentials login", () => {
  it("still accepts an existing password shorter than 15 characters", async () => {
    const user = await authorize({ username: "alice", password: "short123" });

    expect(user).toMatchObject({ id: "user-1", username: "alice" });
  });

  it("rejects a wrong password", async () => {
    expect(
      await authorize({ username: "alice", password: "wrong-password" }),
    ).toBeNull();
  });

  it("rejects an unknown user", async () => {
    mocks.findFirst.mockResolvedValue(null);

    expect(
      await authorize({ username: "nobody", password: "short123" }),
    ).toBeNull();
  });

  it("rejects missing credentials without looking anyone up", async () => {
    expect(await authorize({ username: "alice", password: "" })).toBeNull();
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
