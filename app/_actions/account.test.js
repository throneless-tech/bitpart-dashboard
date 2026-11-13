import bcrypt from "bcryptjs";
import { signJWT } from "better-auth/crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = vi.hoisted(() => "test-secret-test-secret-test-secret");

const mocks = vi.hoisted(() => ({
  users: [],
  accounts: [],
  getUser: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailChangedNotice: vi.fn(),
  sendPasswordChangedNotice: vi.fn(),
  clearMailThrottle: vi.fn(),
  clearResetTokens: vi.fn(),
  deleteSessions: vi.fn(),
  api: {
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    sendVerificationEmail: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    signOut: vi.fn(),
  },
  redirect: vi.fn((path) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { path });
  }),
}));

// a tiny in-memory stand-in for the User table, enough for these queries
const lower = (v) => (typeof v === "string" ? v.toLowerCase() : v);
const fieldMatches = (value, cond) => {
  if (cond && typeof cond === "object" && "equals" in cond) {
    return cond.mode === "insensitive"
      ? lower(value) === lower(cond.equals)
      : value === cond.equals;
  }
  if (cond && typeof cond === "object" && "not" in cond) {
    return value !== cond.not;
  }
  return value === cond;
};
const rowMatches = (row, where) =>
  Object.entries(where).every(([k, v]) =>
    k === "OR" ? v.some((w) => rowMatches(row, w)) : fieldMatches(row[k], v),
  );

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(
        async ({ where }) =>
          mocks.users.find((u) => rowMatches(u, where)) ?? null,
      ),
      findUnique: vi.fn(
        async ({ where }) =>
          mocks.users.find((u) => rowMatches(u, where)) ?? null,
      ),
      update: vi.fn(async ({ where, data }) => {
        const user = mocks.users.find((u) => rowMatches(u, where));
        Object.assign(user, data);
        return user;
      }),
      updateMany: vi.fn(async ({ where, data }) => {
        const found = mocks.users.filter((u) => rowMatches(u, where));
        found.forEach((u) => Object.assign(u, data));
        return { count: found.length };
      }),
    },
    account: {
      findFirst: vi.fn(
        async ({ where }) =>
          mocks.accounts.find((a) => rowMatches(a, where)) ?? null,
      ),
    },
    session: { deleteMany: mocks.deleteSessions },
    twoFactor: { findUnique: vi.fn(async () => null) },
    passkey: { findMany: vi.fn(async () => []) },
  },
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("./getUser", () => ({ getUser: mocks.getUser }));
vi.mock("@/auth", () => ({
  betterAuthServer: {
    api: mocks.api,
    $context: Promise.resolve({ secret: SECRET }),
  },
}));
vi.mock("@/app/_lib/mailThrottle", () => ({
  clearMailThrottle: mocks.clearMailThrottle,
  clearResetTokens: mocks.clearResetTokens,
}));
vi.mock("@/app/_lib/accountEmails", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  sendEmailChangedNotice: mocks.sendEmailChangedNotice,
  sendPasswordChangedNotice: mocks.sendPasswordChangedNotice,
}));

import { authMailCallback } from "@/app/_lib/authMail";
import {
  cancelEmailChange,
  changeEmail,
  changePassword,
  getAccountSettings,
  removeEmail,
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  setBotIssueNotifications,
  verifyEmail,
} from "./account";

const form = (fields) => {
  const data = new FormData();
  Object.entries(fields).forEach(([k, v]) => data.set(k, v));
  return data;
};

const redirectOf = async (promise) => {
  try {
    await promise;
  } catch (error) {
    if (error.path) return error.path;
    throw error;
  }
  return null;
};

// what better auth puts in its email links
const changeToken = (user, updateTo) =>
  signJWT(
    {
      email: user.email,
      updateTo,
      requestType: "change-email-verification",
      userId: user.id,
    },
    SECRET,
  );
const verifyToken = (user) =>
  signJWT({ email: user.email, userId: user.id }, SECRET);

const PLACEHOLDER = "0b6e6f2e-7c4e-4a43-9d0f-2f7f3b1d9b11@no-email.invalid";

let alice;

beforeEach(async () => {
  alice = {
    id: "user-1",
    username: "alice",
    email: "alice@mail.org",
    emailVerified: false,
    pendingEmail: null,
    notifyBotIssues: true,
  };
  mocks.users.length = 0;
  mocks.users.push(alice, {
    id: "user-2",
    username: "bob",
    email: "bob@mail.org",
    emailVerified: true,
    pendingEmail: null,
  });
  mocks.accounts.length = 0;
  mocks.accounts.push({
    userId: "user-1",
    providerId: "credential",
    password: await bcrypt.hash("old-password", 4),
  });
  mocks.getUser.mockImplementation(async (username) =>
    username === "alice" ? alice : null,
  );
  mocks.sendVerificationEmail.mockResolvedValue(true);
  mocks.sendPasswordResetEmail.mockResolvedValue(true);

  // better auth asks for its emails through the send callbacks
  mocks.api.requestPasswordReset.mockImplementation(async ({ body }) => {
    const user = mocks.users.find((u) => u.email === body.email);
    await authMailCallback("reset-password")({ user, token: "reset-tok" });
  });
  mocks.api.sendVerificationEmail.mockImplementation(async ({ body }) => {
    const user = mocks.users.find((u) => u.email === body.email);
    await authMailCallback("verify-email")({ user, token: "verify-tok" });
  });
  mocks.api.changeEmail.mockImplementation(async ({ body }) => {
    if (!alice.emailVerified) {
      alice.email = body.newEmail;
    }
    await authMailCallback("verify-email")({
      user: { ...alice, email: body.newEmail },
      token: "change-tok",
    });
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAccountSettings", () => {
  it("doesn't show a placeholder email", async () => {
    alice.email = PLACEHOLDER;

    expect(await getAccountSettings("alice")).toMatchObject({
      email: null,
      emailVerified: false,
    });
  });
});

describe("requestPasswordReset", () => {
  const ask = (identifier) =>
    requestPasswordReset(undefined, form({ identifier }));

  it("gives the same answer whether or not the account exists", async () => {
    const found = await ask("alice");
    const missing = await ask("nobody");

    expect(found).toEqual(missing);
    expect(found.success).toMatch(/If an account/);
  });

  it("matches by username or case-insensitive email", async () => {
    await ask("alice");
    await ask("alice@mail.ORG");

    expect(mocks.api.requestPasswordReset).toHaveBeenCalledTimes(2);
    expect(mocks.api.requestPasswordReset).toHaveBeenCalledWith({
      body: { email: "alice@mail.org" },
    });
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith({
      user: alice,
      token: "reset-tok",
    });
  });

  it("sends nothing for an account with a placeholder email", async () => {
    alice.email = PLACEHOLDER;

    expect((await ask("alice")).success).toMatch(/If an account/);
    expect((await ask(PLACEHOLDER)).success).toMatch(/If an account/);
    expect(mocks.api.requestPasswordReset).not.toHaveBeenCalled();
    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("never matches or sends to a pending email", async () => {
    alice.pendingEmail = "new@mail.org";

    await ask("new@mail.org");

    expect(mocks.api.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("hides mail failures behind the same answer", async () => {
    mocks.sendPasswordResetEmail.mockRejectedValue(new Error("smtp down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect((await ask("alice")).success).toMatch(/If an account/);
  });
});

describe("resetPassword", () => {
  const reset = (password, passwordConfirm = password) =>
    resetPassword(undefined, form({ token: "tok", password, passwordConfirm }));

  it("resets through better auth and redirects", async () => {
    expect(await redirectOf(reset("a-long-new-password"))).toBe(
      "/login?message=PasswordResetSuccess",
    );
    expect(mocks.api.resetPassword).toHaveBeenCalledWith({
      body: { newPassword: "a-long-new-password", token: "tok" },
    });
  });

  it("rejects an invalid or expired token", async () => {
    mocks.api.resetPassword.mockRejectedValue(new Error("INVALID_TOKEN"));

    const result = await reset("a-long-new-password");

    expect(result.error.general).toMatch(/invalid or has expired/);
  });

  it("checks the password before using up the token", async () => {
    expect((await reset("fourteen-chars")).error.password).toMatch(
      /at least 15/,
    );
    expect(
      (await reset("a-long-new-password", "other")).error.password,
    ).toMatch(/do not match/);
    expect(mocks.api.resetPassword).not.toHaveBeenCalled();
  });
});

describe("verifyEmail", () => {
  it("confirms the current email", async () => {
    const token = await verifyToken(alice);

    expect(await verifyEmail(token)).toEqual({ email: "alice@mail.org" });
    expect(mocks.api.verifyEmail).toHaveBeenCalledWith({ query: { token } });
  });

  it("applies the waiting email change and notifies the old address", async () => {
    alice.emailVerified = true;
    alice.pendingEmail = "new@mail.org";
    const token = await changeToken(alice, "new@mail.org");

    expect(await verifyEmail(token)).toEqual({ email: "new@mail.org" });
    expect(mocks.api.verifyEmail).toHaveBeenCalledWith({ query: { token } });
    expect(alice.pendingEmail).toBeNull();
    expect(mocks.sendEmailChangedNotice).toHaveBeenCalledWith({
      username: "alice",
      oldEmail: "alice@mail.org",
      newEmail: "new@mail.org",
    });
  });

  it("refuses a change link after the change was cancelled", async () => {
    alice.emailVerified = true;
    alice.pendingEmail = "new@mail.org";
    const token = await changeToken(alice, "new@mail.org");

    await cancelEmailChange("alice");

    expect((await verifyEmail(token)).error).toMatch(/invalid or has expired/);
    expect(mocks.api.verifyEmail).not.toHaveBeenCalled();
  });

  it("refuses a change link for an earlier, replaced change", async () => {
    alice.emailVerified = true;
    alice.pendingEmail = "newer@mail.org";
    const token = await changeToken(alice, "new@mail.org");

    expect((await verifyEmail(token)).error).toMatch(/invalid or has expired/);
    expect(mocks.api.verifyEmail).not.toHaveBeenCalled();
  });

  it("refuses if the pending email was taken in the meantime", async () => {
    alice.emailVerified = true;
    alice.pendingEmail = "bob@mail.org";
    const token = await changeToken(alice, "bob@mail.org");

    expect((await verifyEmail(token)).error).toMatch(/another account/);
    expect(mocks.api.verifyEmail).not.toHaveBeenCalled();
  });

  it("rejects an invalid token", async () => {
    expect((await verifyEmail("not-a-token")).error).toMatch(
      /invalid or has expired/,
    );
    const forged = await signJWT(
      { email: alice.email, userId: alice.id },
      "some-other-secret-some-other-secret",
    );
    expect((await verifyEmail(forged)).error).toMatch(/invalid or has expired/);
    expect(mocks.api.verifyEmail).not.toHaveBeenCalled();
  });

  it("maps a better auth failure to the same message", async () => {
    mocks.api.verifyEmail.mockRejectedValue(new Error("TOKEN_EXPIRED"));

    expect((await verifyEmail(await verifyToken(alice))).error).toMatch(
      /invalid or has expired/,
    );
  });
});

describe("resendVerificationEmail", () => {
  it("resends for an unconfirmed real email", async () => {
    expect((await resendVerificationEmail("alice")).success).toMatch(/sent/);
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
      user: alice,
      token: "verify-tok",
    });
  });

  it("resends the link for a waiting email change", async () => {
    alice.emailVerified = true;
    alice.pendingEmail = "new@mail.org";

    expect((await resendVerificationEmail("alice")).success).toMatch(/sent/);
    expect(mocks.api.changeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ body: { newEmail: "new@mail.org" } }),
    );
    expect(alice.pendingEmail).toBe("new@mail.org");
  });

  it("sends nothing to a placeholder or confirmed email", async () => {
    alice.email = PLACEHOLDER;
    expect((await resendVerificationEmail("alice")).error).toMatch(
      /couldn't send/,
    );

    alice.email = "alice@mail.org";
    alice.emailVerified = true;
    expect((await resendVerificationEmail("alice")).error).toMatch(
      /couldn't send/,
    );
    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("reports a throttled resend", async () => {
    mocks.sendVerificationEmail.mockResolvedValue(false);

    expect((await resendVerificationEmail("alice")).error).toMatch(
      /wait a couple of minutes/,
    );
  });
});

describe("changeEmail", () => {
  const change = (email, currentPassword = "old-password") =>
    changeEmail(undefined, form({ username: "alice", currentPassword, email }));

  it("requires the current password", async () => {
    const result = await change("new@mail.org", "wrong");

    expect(result.error.currentPassword).toMatch(/incorrect/);
    expect(mocks.api.changeEmail).not.toHaveBeenCalled();
  });

  it("keeps a confirmed email until the new one is confirmed", async () => {
    alice.emailVerified = true;

    const result = await change("New@Mail.org");

    expect(result.success).toMatch(/sent a confirmation link to new@mail.org/);
    expect(mocks.api.changeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ body: { newEmail: "new@mail.org" } }),
    );
    expect(alice.email).toBe("alice@mail.org");
    expect(alice.pendingEmail).toBe("new@mail.org");
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
      user: expect.objectContaining({ email: "new@mail.org" }),
      token: "change-tok",
    });
  });

  it("switches an unconfirmed email straight away", async () => {
    const result = await change("new@mail.org");

    expect(result.success).toMatch(/sent a confirmation link/);
    expect(alice.email).toBe("new@mail.org");
    expect(alice.pendingEmail).toBeNull();
  });

  it("replaces a placeholder straight away", async () => {
    alice.email = PLACEHOLDER;

    await change("new@mail.org");

    expect(alice.email).toBe("new@mail.org");
    expect(alice.pendingEmail).toBeNull();
  });

  it("says when the link couldn't be sent", async () => {
    mocks.sendVerificationEmail.mockRejectedValue(new Error("smtp down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect((await change("new@mail.org")).success).toMatch(/couldn't send/);
  });

  it("rejects an email used by another account, in any case", async () => {
    expect((await change("BOB@mail.org")).error.email).toMatch(/in use/);
  });

  it("rejects an invalid email, a placeholder and the current email", async () => {
    expect((await change("nope")).error.email).toMatch(/valid/);
    expect((await change(PLACEHOLDER)).error.email).toMatch(/valid/);
    expect((await change("ALICE@mail.org")).error.email).toMatch(/already/);
    expect(mocks.api.changeEmail).not.toHaveBeenCalled();
  });

  it("refuses when not logged in as that user", async () => {
    const result = await changeEmail(
      undefined,
      form({ username: "bob", currentPassword: "x", email: "n@mail.org" }),
    );

    expect(result.error.general).toMatch(/logged in/);
  });
});

describe("removeEmail", () => {
  it("requires the current password", async () => {
    const result = await removeEmail(
      undefined,
      form({ username: "alice", currentPassword: "wrong" }),
    );

    expect(result.error.currentPassword).toMatch(/incorrect/);
    expect(alice.email).toBe("alice@mail.org");
  });

  it("refuses while email sign-in codes are on", async () => {
    alice.emailVerified = true;
    alice.emailOtpEnabled = true;

    const result = await removeEmail(
      undefined,
      form({ username: "alice", currentPassword: "old-password" }),
    );

    expect(result.error.general).toMatch(/Turn off email sign-in codes/);
    expect(alice.email).toBe("alice@mail.org");
  });

  it("swaps in a new placeholder and clears any pending change", async () => {
    alice.emailVerified = true;
    alice.pendingEmail = "new@mail.org";

    const result = await removeEmail(
      undefined,
      form({ username: "alice", currentPassword: "old-password" }),
    );

    expect(result.success).toMatch(/removed/);
    expect(alice.email).toMatch(/^[0-9a-f-]{36}@no-email\.invalid$/);
    expect(alice.emailVerified).toBe(false);
    expect(alice.pendingEmail).toBeNull();
    expect(mocks.clearResetTokens).toHaveBeenCalledWith("user-1");
  });
});

describe("changePassword", () => {
  const changeTo = (password, passwordConfirm = password, current) =>
    changePassword(
      undefined,
      form({
        username: "alice",
        currentPassword: current ?? "old-password",
        password,
        passwordConfirm,
      }),
    );

  it("requires the current password", async () => {
    const result = await changeTo("a-long-new-password", undefined, "wrong");

    expect(result.error.currentPassword).toMatch(/incorrect/);
    expect(mocks.api.changePassword).not.toHaveBeenCalled();
  });

  it("changes it, logs out everywhere and notifies by email", async () => {
    expect(await redirectOf(changeTo("a-long-new-password"))).toBe(
      "/login?message=PasswordChangeSuccess",
    );
    expect(mocks.api.changePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          currentPassword: "old-password",
          newPassword: "a-long-new-password",
          revokeOtherSessions: true,
        },
      }),
    );
    expect(mocks.deleteSessions).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
    expect(mocks.api.signOut).toHaveBeenCalled();
    expect(mocks.sendPasswordChangedNotice).toHaveBeenCalledWith(alice);
  });

  it("doesn't notify a placeholder email", async () => {
    alice.email = PLACEHOLDER;

    await redirectOf(changeTo("a-long-new-password"));

    expect(mocks.sendPasswordChangedNotice).not.toHaveBeenCalled();
  });

  it("checks the new password", async () => {
    expect((await changeTo("short")).error.password).toMatch(/at least 15/);
    expect(
      (await changeTo("a-long-new-password", "different")).error.password,
    ).toMatch(/do not match/);
    expect(mocks.api.changePassword).not.toHaveBeenCalled();
  });
});

describe("setBotIssueNotifications", () => {
  it("turns notifications off and back on", async () => {
    expect((await setBotIssueNotifications("alice", false)).success).toMatch(
      /turned off/,
    );
    expect(alice.notifyBotIssues).toBe(false);

    expect((await setBotIssueNotifications("alice", true)).success).toMatch(
      /get an email/,
    );
    expect(alice.notifyBotIssues).toBe(true);
  });

  it("can't be turned on without a real email", async () => {
    alice.email = PLACEHOLDER;
    alice.notifyBotIssues = false;

    expect((await setBotIssueNotifications("alice", true)).error).toMatch(
      /Add an email/,
    );
    expect(alice.notifyBotIssues).toBe(false);
  });

  it("refuses when not logged in as that user", async () => {
    expect((await setBotIssueNotifications("bob", false)).error).toMatch(
      /logged in/,
    );
  });
});
