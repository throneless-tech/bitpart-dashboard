import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  createUser: vi.fn(),
  signupAllowed: vi.fn(),
  recordSignup: vi.fn(),
  redirect: vi.fn((path) => path),
  sendVerificationEmail: vi.fn(),
  apiSendVerificationEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: mocks.findFirst,
    },
  },
}));

vi.mock("@/auth", () => ({
  betterAuthServer: {
    api: {
      signUpEmail: mocks.createUser,
      sendVerificationEmail: mocks.apiSendVerificationEmail,
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));

vi.mock("@/app/_lib/signupRateLimit", async (importOriginal) => ({
  clientIp: (await importOriginal()).clientIp,
  signupAllowed: mocks.signupAllowed,
  recordSignup: mocks.recordSignup,
}));

vi.mock("@/app/_lib/accountEmails", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
  sendPasswordResetEmail: vi.fn(),
}));

import { authMailCallback } from "@/app/_lib/authMail";
import { register } from "./register";

const PLACEHOLDER = /^[0-9a-f-]{36}@no-email\.invalid$/;

const buildFormData = ({ username, password, email }) => {
  const formData = new FormData();
  formData.set("username", username ?? "");
  formData.set("password", password ?? "");
  formData.set("passwordConfirm", password ?? "");
  formData.set("email", email ?? "");
  return formData;
};

beforeEach(() => {
  // no existing user, under the rate limit, successful writes by default
  mocks.findFirst.mockResolvedValue(null);
  mocks.signupAllowed.mockResolvedValue(true);
  mocks.createUser.mockResolvedValue({ token: null, user: { id: "user-1" } });
  // better auth hands the link to the send callback
  mocks.apiSendVerificationEmail.mockImplementation(async ({ body }) =>
    authMailCallback("verify-email")({
      user: { id: "user-1", username: "alice", email: body.email },
      token: "verify-tok",
    }),
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("register email normalization", () => {
  it("stores a blank email as null", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "",
      }),
    );

    expect(mocks.createUser).toHaveBeenCalledTimes(1);
    expect(mocks.createUser.mock.calls[0][0].body.email).toMatch(PLACEHOLDER);
  });

  it("does not query by email when the email field is blank", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "",
      }),
    );

    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.OR).toEqual([{ username: "alice" }]);
  });

  it("queries by email when one is provided", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "alice@mail.org",
      }),
    );

    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.OR).toContainEqual({
      email: { equals: "alice@mail.org", mode: "insensitive" },
    });
    expect(where.OR).toContainEqual({ username: "alice" });
  });

  it("treats a whitespace-only email as null", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "   ",
      }),
    );

    expect(mocks.createUser.mock.calls[0][0].body.email).toMatch(PLACEHOLDER);
    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.OR).toEqual([{ username: "alice" }]);
  });

  it("trims surrounding whitespace from the email", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: " alice@mail.org ",
      }),
    );

    expect(mocks.createUser.mock.calls[0][0].body.email).toBe("alice@mail.org");
    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.OR).toContainEqual({
      email: { equals: "alice@mail.org", mode: "insensitive" },
    });
  });

  it("succeeds with a blank email even if other email-less accounts exist", async () => {
    // the duplicate check must not match on a shared-blank email
    const result = await register(
      undefined,
      buildFormData({
        username: "bob",
        password: "a-long-enough-password",
        email: "",
      }),
    );

    expect(result).toBe("/login?message=SignUpSuccess");
    expect(mocks.createUser).toHaveBeenCalledTimes(1);
  });

  it("still reports duplicates when a matching user is found", async () => {
    mocks.findFirst.mockResolvedValue({ id: "existing", username: "alice" });

    const result = await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "",
      }),
    );

    expect(result.error.username).toBe(
      "A user with these credentials already exists.",
    );
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
});

describe("register confirmation email", () => {
  it("sends a confirmation email when an email is given", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "alice@mail.org",
      }),
    );

    expect(mocks.createUser.mock.calls[0][0].body).toEqual({
      email: "alice@mail.org",
      password: "a-long-enough-password",
      name: "alice",
      username: "alice",
    });
    expect(mocks.apiSendVerificationEmail).toHaveBeenCalledWith({
      body: { email: "alice@mail.org" },
    });
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
      user: expect.objectContaining({ id: "user-1", email: "alice@mail.org" }),
      token: "verify-tok",
    });
  });

  it("stores emails in lowercase", async () => {
    await register(
      undefined,
      buildFormData({
        username: "Alice",
        password: "a-long-enough-password",
        email: "Alice@Mail.org",
      }),
    );

    expect(mocks.createUser.mock.calls[0][0].body.email).toBe("alice@mail.org");
    expect(mocks.createUser.mock.calls[0][0].body.username).toBe("Alice");
  });

  it("sends nothing without an email", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "",
      }),
    );

    expect(mocks.apiSendVerificationEmail).not.toHaveBeenCalled();
    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("still creates the account if the email can't be sent", async () => {
    mocks.sendVerificationEmail.mockRejectedValue(new Error("smtp down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "a-long-enough-password",
        email: "alice@mail.org",
      }),
    );

    expect(result).toBe("/login?message=SignUpSuccess");
  });
});

describe("register rate limit", () => {
  const signUp = () =>
    register(
      undefined,
      buildFormData({ username: "alice", password: "a-long-enough-password" }),
    );

  it("checks and records the client IP", async () => {
    expect(await signUp()).toBe("/login?message=SignUpSuccess");
    expect(mocks.signupAllowed).toHaveBeenCalledWith("203.0.113.7");
    expect(mocks.recordSignup).toHaveBeenCalledWith("203.0.113.7");
  });

  it("refuses the sign-up when the IP is over the limit", async () => {
    mocks.signupAllowed.mockResolvedValue(false);

    const result = await signUp();

    expect(result.error.general).toMatch(/Too many accounts/);
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.recordSignup).not.toHaveBeenCalled();
  });

  it("doesn't count failed sign-ups against the limit", async () => {
    mocks.findFirst.mockResolvedValue({ id: "existing" });

    await signUp();

    expect(mocks.recordSignup).not.toHaveBeenCalled();
  });
});

describe("register password length", () => {
  const signUp = (password) =>
    register(undefined, buildFormData({ username: "alice", password }));

  it("requires at least 15 characters", async () => {
    const result = await signUp("fourteen-chars");

    expect(result.error.password).toBe(
      "Password must contain at least 15 characters",
    );
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("accepts exactly 15 characters", async () => {
    expect(await signUp("fifteen-chars!!")).toBe(
      "/login?message=SignUpSuccess",
    );
  });

  it("requires a username", async () => {
    const result = await register(
      undefined,
      buildFormData({ username: "", password: "a-long-enough-password" }),
    );

    expect(result.error.username).toBe("Enter your username");
  });
});
