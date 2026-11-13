import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signInUsername: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/auth", () => ({
  betterAuthServer: {
    api: {
      signInEmail: mocks.signInEmail,
      signInUsername: mocks.signInUsername,
    },
  },
}));

import { login } from "./login";

const form = (username, password = "pw") => {
  const data = new FormData();
  data.set("username", username);
  data.set("password", password);
  return data;
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("login", () => {
  it("logs in by username", async () => {
    expect((await login(form("alice"))).success).toBe(true);
    expect(mocks.signInUsername).toHaveBeenCalledWith(
      expect.objectContaining({ body: { username: "alice", password: "pw" } }),
    );
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it("logs in by email", async () => {
    expect((await login(form("alice@mail.org"))).success).toBe(true);
    expect(mocks.signInEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { email: "alice@mail.org", password: "pw" },
      }),
    );
    expect(mocks.signInUsername).not.toHaveBeenCalled();
  });

  it("falls back to a username containing @", async () => {
    mocks.signInEmail.mockRejectedValue(new Error("INVALID_EMAIL"));

    expect((await login(form("al@ice"))).success).toBe(true);
    expect(mocks.signInUsername).toHaveBeenCalled();
  });

  it("never logs in with a placeholder email", async () => {
    mocks.signInUsername.mockRejectedValue(new Error("INVALID"));

    const result = await login(
      form("0b6e6f2e-7c4e-4a43-9d0f-2f7f3b1d9b11@no-email.invalid"),
    );

    expect(result).toEqual({ success: false, message: "CredentialsSignin" });
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it("fails for bad credentials or missing fields", async () => {
    mocks.signInUsername.mockRejectedValue(new Error("INVALID"));

    expect((await login(form("alice"))).success).toBe(false);
    expect((await login(form("", ""))).success).toBe(false);
  });
});
