import bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  users: [],
  getUser: vi.fn(),
  consumeToken: vi.fn(),
  clearTokens: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailChangedNotice: vi.fn(),
  sendPasswordChangedNotice: vi.fn(),
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
        for (const [k, v] of Object.entries(data)) {
          if (v && typeof v === "object" && "increment" in v) {
            user[k] += v.increment;
          } else {
            user[k] = v;
          }
        }
        if (
          user.email &&
          mocks.users.some((u) => u !== user && u.email === user.email)
        ) {
          throw Object.assign(new Error("Unique constraint"), {
            code: "P2002",
          });
        }
        return user;
      }),
    },
  },
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./getUser", () => ({ getUser: mocks.getUser }));
vi.mock("@/app/_lib/tokens", () => ({
  consumeToken: mocks.consumeToken,
  clearTokens: mocks.clearTokens,
}));
vi.mock("@/app/_lib/accountEmails", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  sendEmailChangedNotice: mocks.sendEmailChangedNotice,
  sendPasswordChangedNotice: mocks.sendPasswordChangedNotice,
}));

import {
  changeEmail,
  changePassword,
  removeEmail,
  requestPasswordReset,
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

let alice;

beforeEach(async () => {
  alice = {
    id: "user-1",
    username: "alice",
    email: "Alice@Mail.org",
    emailVerified: null,
    pendingEmail: null,
    password: await bcrypt.hash("old-password", 4),
    sessionVersion: 0,
    notifyBotIssues: true,
  };
  mocks.users.length = 0;
  mocks.users.push(alice, {
    id: "user-2",
    username: "bob",
    email: "bob@mail.org",
    emailVerified: new Date(),
    pendingEmail: null,
    password: "x",
    sessionVersion: 0,
  });
  mocks.getUser.mockImplementation(async (username) =>
    username === "alice" ? alice : null,
  );
  mocks.sendVerificationEmail.mockResolvedValue(true);
  mocks.sendPasswordResetEmail.mockResolvedValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
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

    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledTimes(2);
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(alice);
  });

  it("sends nothing for an account without an email", async () => {
    alice.email = null;

    const result = await ask("alice");

    expect(result.success).toMatch(/If an account/);
    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("never matches or sends to a pending email", async () => {
    alice.pendingEmail = "new@mail.org";

    await ask("new@mail.org");

    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled();
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

  it("sets the new password, signs out sessions and redirects", async () => {
    mocks.consumeToken.mockResolvedValue("user-1");

    expect(await redirectOf(reset("a-long-new-password"))).toBe(
      "/login?message=PasswordResetSuccess",
    );
    expect(mocks.consumeToken).toHaveBeenCalledWith("reset-password", "tok");
    expect(await bcrypt.compare("a-long-new-password", alice.password)).toBe(
      true,
    );
    expect(alice.sessionVersion).toBe(1);
  });

  it("rejects an invalid or expired token", async () => {
    mocks.consumeToken.mockResolvedValue(null);

    const result = await reset("a-long-new-password");

    expect(result.error.general).toMatch(/invalid or has expired/);
    expect(alice.sessionVersion).toBe(0);
  });

  it("checks the password before using up the token", async () => {
    expect((await reset("fourteen-chars")).error.password).toMatch(
      /at least 15/,
    );
    expect(
      (await reset("a-long-new-password", "other")).error.password,
    ).toMatch(/do not match/);
    expect(mocks.consumeToken).not.toHaveBeenCalled();
  });
});

describe("verifyEmail", () => {
  it("confirms the current email", async () => {
    mocks.consumeToken.mockResolvedValue("user-1");

    expect(await verifyEmail("tok")).toEqual({ email: "Alice@Mail.org" });
    expect(alice.emailVerified).toBeInstanceOf(Date);
    expect(mocks.consumeToken).toHaveBeenCalledWith("verify-email", "tok");
  });

  it("swaps in a pending email and notifies the old address", async () => {
    alice.pendingEmail = "new@mail.org";
    mocks.consumeToken.mockResolvedValue("user-1");

    expect(await verifyEmail("tok")).toEqual({ email: "new@mail.org" });
    expect(alice.email).toBe("new@mail.org");
    expect(alice.pendingEmail).toBeNull();
    expect(alice.emailVerified).toBeInstanceOf(Date);
    expect(mocks.sendEmailChangedNotice).toHaveBeenCalledWith({
      username: "alice",
      oldEmail: "Alice@Mail.org",
      newEmail: "new@mail.org",
    });
  });

  it("refuses if the pending email was taken in the meantime", async () => {
    alice.pendingEmail = "bob@mail.org";
    mocks.consumeToken.mockResolvedValue("user-1");

    expect((await verifyEmail("tok")).error).toMatch(/another account/);
  });

  it("rejects an invalid token", async () => {
    mocks.consumeToken.mockResolvedValue(null);

    expect((await verifyEmail("tok")).error).toMatch(/invalid or has expired/);
    expect(alice.emailVerified).toBeNull();
  });
});

describe("changeEmail", () => {
  const change = (email, currentPassword = "old-password") =>
    changeEmail(undefined, form({ username: "alice", currentPassword, email }));

  it("requires the current password", async () => {
    const result = await change("new@mail.org", "wrong");

    expect(result.error.currentPassword).toMatch(/incorrect/);
    expect(alice.pendingEmail).toBeNull();
  });

  it("keeps the old email until the new one is confirmed", async () => {
    const result = await change(" new@mail.org ");

    expect(result.success).toMatch(/new@mail.org/);
    expect(alice.email).toBe("Alice@Mail.org");
    expect(alice.pendingEmail).toBe("new@mail.org");
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ pendingEmail: "new@mail.org" }),
    );
  });

  it("uses the new email straight away when there was none", async () => {
    alice.email = null;

    await change("new@mail.org");

    expect(alice.email).toBe("new@mail.org");
    expect(alice.emailVerified).toBeNull();
    expect(alice.pendingEmail).toBeNull();
  });

  it("rejects an email used by another account, in any case", async () => {
    expect((await change("BOB@mail.org")).error.email).toMatch(/in use/);
  });

  it("rejects an invalid email and the current email", async () => {
    expect((await change("not-an-email")).error.email).toMatch(/valid/);
    expect((await change("alice@mail.org")).error.email).toMatch(/already/);
  });

  it("refuses when not logged in as that user", async () => {
    mocks.getUser.mockResolvedValue(null);

    expect((await change("new@mail.org")).error.general).toMatch(/logged in/);
  });
});

describe("removeEmail", () => {
  it("requires the current password", async () => {
    const result = await removeEmail(
      undefined,
      form({ username: "alice", currentPassword: "wrong" }),
    );

    expect(result.error.currentPassword).toMatch(/incorrect/);
    expect(alice.email).toBe("Alice@Mail.org");
  });

  it("clears the email, confirmation and any pending change", async () => {
    alice.pendingEmail = "new@mail.org";
    alice.emailVerified = new Date();

    await removeEmail(
      undefined,
      form({ username: "alice", currentPassword: "old-password" }),
    );

    expect(alice.email).toBeNull();
    expect(alice.emailVerified).toBeNull();
    expect(alice.pendingEmail).toBeNull();
  });
});

describe("changePassword", () => {
  const change = (fields) =>
    changePassword(
      undefined,
      form({
        username: "alice",
        currentPassword: "old-password",
        password: "a-long-new-password",
        passwordConfirm: "a-long-new-password",
        ...fields,
      }),
    );

  it("requires the current password", async () => {
    const result = await change({ currentPassword: "wrong" });

    expect(result.error.currentPassword).toMatch(/incorrect/);
    expect(alice.sessionVersion).toBe(0);
  });

  it("stores a hash, signs out every session and notifies by email", async () => {
    expect(await redirectOf(change({}))).toBe(
      "/login?message=PasswordChangeSuccess",
    );
    expect(alice.password).not.toBe("a-long-new-password");
    expect(await bcrypt.compare("a-long-new-password", alice.password)).toBe(
      true,
    );
    expect(alice.sessionVersion).toBe(1);
    expect(mocks.sendPasswordChangedNotice).toHaveBeenCalled();
  });

  it("checks the new password", async () => {
    expect(
      (
        await change({
          password: "fourteen-chars",
          passwordConfirm: "fourteen-chars",
        })
      ).error.password,
    ).toMatch(/at least 15/);
    expect(
      (await change({ passwordConfirm: "different" })).error.password,
    ).toMatch(/do not match/);
  });
});

describe("setBotIssueNotifications", () => {
  it("turns notifications off and back on", async () => {
    expect((await setBotIssueNotifications("alice", false)).success).toMatch(
      /turned off/,
    );
    expect(alice.notifyBotIssues).toBe(false);

    await setBotIssueNotifications("alice", true);
    expect(alice.notifyBotIssues).toBe(true);
  });

  it("can't be turned on without an email", async () => {
    alice.email = null;
    alice.notifyBotIssues = false;

    expect((await setBotIssueNotifications("alice", true)).error).toMatch(
      /Add an email/,
    );
    expect(alice.notifyBotIssues).toBe(false);
  });

  it("refuses when not logged in as that user", async () => {
    mocks.getUser.mockResolvedValue(null);

    expect((await setBotIssueNotifications("alice", false)).error).toMatch(
      /logged in/,
    );
    expect(alice.notifyBotIssues).toBe(true);
  });
});
