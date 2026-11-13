import bcrypt from "bcryptjs";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
});

const mocks = vi.hoisted(() => ({
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendTwoFactorCode: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/app/_lib/accountEmails", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  sendTwoFactorCode: mocks.sendTwoFactorCode,
  EMAIL_CODE_MINUTES: 5,
}));

import { base32 } from "@better-auth/utils/base32";
import { createOTP } from "@better-auth/utils/otp";
import { authOptions } from "./auth";
import { collectAuthMail } from "@/app/_lib/authMail";

// the real config, on an in-memory database
let db;
let auth;

const addUser = async ({ id, username, email, emailVerified, password }) => {
  const now = new Date();
  db.user.push({
    id,
    name: username,
    username,
    email,
    emailVerified,
    createdAt: now,
    updatedAt: now,
  });
  db.account.push({
    id: `acc-${id}`,
    accountId: id,
    providerId: "credential",
    userId: id,
    password: await bcrypt.hash(password, 4),
    createdAt: now,
    updatedAt: now,
  });
};

const cookieFor = async (username, password) => {
  const { headers } = await auth.api.signInUsername({
    body: { username, password },
    returnHeaders: true,
  });
  return new Headers({
    cookie: headers.get("set-cookie").split(";")[0],
  });
};

beforeEach(async () => {
  db = {
    user: [],
    session: [],
    account: [],
    verification: [],
    rateLimit: [],
    twoFactor: [],
    passkey: [],
  };
  auth = betterAuth({ ...authOptions, database: memoryAdapter(db) });
  vi.clearAllMocks();
  // a user from before the move, with a password shorter than the minimum
  await addUser({
    id: "u1",
    username: "Old User",
    email: "old@mail.org",
    emailVerified: true,
    password: "short",
  });
});

describe("logging in", () => {
  it("still accepts an existing password shorter than 15 characters", async () => {
    const byName = await auth.api.signInUsername({
      body: { username: "Old User", password: "short" },
    });
    const byEmail = await auth.api.signInEmail({
      body: { email: "Old@Mail.org", password: "short" },
    });

    expect(byName.user.id).toBe("u1");
    expect(byEmail.user.id).toBe("u1");
  });

  it("rejects a wrong password and an unknown user", async () => {
    await expect(
      auth.api.signInUsername({
        body: { username: "Old User", password: "wrong" },
      }),
    ).rejects.toThrow();
    await expect(
      auth.api.signInUsername({
        body: { username: "old user", password: "short" },
      }),
    ).rejects.toThrow();
  });
});

describe("signing up", () => {
  it("keeps the username as typed and needs 15 characters", async () => {
    await expect(
      auth.api.signUpEmail({
        body: {
          email: "a@mail.org",
          password: "fourteen-chars",
          name: "A b",
          username: "A b",
        },
      }),
    ).rejects.toThrow();

    const { user } = await auth.api.signUpEmail({
      body: {
        email: "a@mail.org",
        password: "fifteen-chars!!",
        name: "Mixed Case.@name",
        username: "Mixed Case.@name",
      },
    });

    expect(user.username).toBe("Mixed Case.@name");
    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled();
  });
});

describe("/api/auth", () => {
  const post = (path, body = {}) =>
    auth.handler(
      new Request(`http://localhost:3000/api/auth${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000",
          "x-real-ip": "203.0.113.7",
        },
        body: JSON.stringify(body),
      }),
    );

  it("doesn't expose the flows the server actions guard", async () => {
    for (const path of authOptions.disabledPaths) {
      expect((await post(path)).status).toBe(404);
    }
  });

  it("still serves sign-in and sessions", async () => {
    const res = await post("/sign-in/username", {
      username: "Old User",
      password: "short",
    });

    expect(res.status).toBe(200);
    const session = await auth.handler(
      new Request("http://localhost:3000/api/auth/get-session", {
        headers: { cookie: res.headers.get("set-cookie").split(";")[0] },
      }),
    );
    expect((await session.json()).user.username).toBe("Old User");
  });
});

describe("changing email", () => {
  it("sends a change link to the new address and keeps a confirmed one", async () => {
    const headers = await cookieFor("Old User", "short");

    const { mail } = await collectAuthMail(() =>
      auth.api.changeEmail({ body: { newEmail: "new@mail.org" }, headers }),
    );

    expect(db.user[0].email).toBe("old@mail.org");
    expect(mail).toHaveLength(1);
    expect(mail[0].user.email).toBe("new@mail.org");
    // the token is a change-email link for the new address
    const payload = JSON.parse(
      Buffer.from(mail[0].token.split(".")[1], "base64url"),
    );
    expect(payload).toMatchObject({
      email: "old@mail.org",
      updateTo: "new@mail.org",
      requestType: "change-email-verification",
      userId: "u1",
    });
    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("switches an unconfirmed or placeholder address straight away", async () => {
    db.user[0].emailVerified = false;
    db.user[0].email = "0b6e6f2e-7c4e-4a43-9d0f-2f7f3b1d9b11@no-email.invalid";
    const headers = await cookieFor("Old User", "short");

    const { mail } = await collectAuthMail(() =>
      auth.api.changeEmail({ body: { newEmail: "New@Mail.org" }, headers }),
    );

    expect(db.user[0].email).toBe("new@mail.org");
    expect(db.user[0].emailVerified).toBe(false);
    expect(mail[0].user.email).toBe("new@mail.org");
  });
});

describe("password reset", () => {
  it("hands the token to the action and ends sessions on reset", async () => {
    await cookieFor("Old User", "short");
    expect(db.session).toHaveLength(1);

    const { mail } = await collectAuthMail(() =>
      auth.api.requestPasswordReset({ body: { email: "old@mail.org" } }),
    );
    await auth.api.resetPassword({
      body: { newPassword: "a-long-new-password", token: mail[0].token },
    });

    expect(db.session).toHaveLength(0);
    expect(
      (
        await auth.api.signInUsername({
          body: { username: "Old User", password: "a-long-new-password" },
        })
      ).user.id,
    ).toBe("u1");
  });
});

// cookies from a response, as a request cookie header (dropping cleared ones)
const cookiesFrom = (responseHeaders, previous = new Headers()) => {
  const jar = new Map(
    (previous.get("cookie") ?? "")
      .split("; ")
      .filter(Boolean)
      .map((c) => c.split(/=(.*)/s).slice(0, 2)),
  );
  for (const raw of responseHeaders.getSetCookie()) {
    const [pair, ...attrs] = raw.split("; ");
    const [name, value] = pair.split(/=(.*)/s);
    if (attrs.some((a) => /^max-age=0$/i.test(a)) || !value) jar.delete(name);
    else jar.set(name, value);
  }
  return new Headers({
    cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
  });
};

const passwordLogin = async (username = "Old User", password = "short") => {
  const { headers, response } = await auth.api.signInUsername({
    body: { username, password },
    returnHeaders: true,
  });
  return { response, headers: cookiesFrom(headers) };
};

// turn on an authenticator app the way the settings actions do
const setUpTotp = async () => {
  const { headers } = await passwordLogin();
  const { totpURI, backupCodes } = await auth.api.enableTwoFactor({
    body: { password: "short", method: "totp" },
    headers,
  });
  // what an authenticator app does with the key in the qr code
  const secret = new TextDecoder().decode(
    base32.decode(new URL(totpURI).searchParams.get("secret")),
  );
  const code = await createOTP(secret).totp();
  await auth.api.verifyTOTP({ body: { code }, headers });
  return { secret, backupCodes };
};

describe("two-factor login", () => {
  it("asks for a second factor after the password, then logs in with totp", async () => {
    const { secret, backupCodes } = await setUpTotp();

    expect(db.user[0].twoFactorEnabled).toBe(true);
    expect(db.twoFactor[0].verified).toBe(true);
    // stored encrypted
    expect(db.twoFactor[0].secret).not.toContain(secret);
    expect(db.twoFactor[0].backupCodes).not.toContain(backupCodes[0]);

    const before = db.session.length;
    const { response, headers } = await passwordLogin();
    expect(response).toEqual({
      twoFactorRedirect: true,
      twoFactorMethods: ["totp", "backup"],
    });
    // no session until the second factor
    expect(db.session).toHaveLength(before);

    const result = await auth.api.verifyTOTP({
      body: { code: await createOTP(secret).totp() },
      headers,
    });

    expect(result.token).toBeTruthy();
    expect(db.session).toHaveLength(before + 1);
  });

  it("accepts each backup code once", async () => {
    const { backupCodes } = await setUpTotp();

    const first = await passwordLogin();
    expect(
      (
        await auth.api.verifyBackupCode({
          body: { code: backupCodes[0] },
          headers: first.headers,
        })
      ).token,
    ).toBeTruthy();

    const second = await passwordLogin();
    await expect(
      auth.api.verifyBackupCode({
        body: { code: backupCodes[0] },
        headers: second.headers,
      }),
    ).rejects.toThrow();
  });

  it("sends email codes to a confirmed address and never to a placeholder", async () => {
    // email codes only, as enableEmailCodes leaves things
    await setUpTotp();
    db.twoFactor[0].verified = false;
    db.user[0].emailOtpEnabled = true;

    const login = await passwordLogin();
    expect(login.response.twoFactorMethods).toEqual(["otp", "backup"]);
    await auth.api.sendTwoFactorOTP({ body: {}, headers: login.headers });
    expect(mocks.sendTwoFactorCode).toHaveBeenCalledTimes(1);
    const { code } = mocks.sendTwoFactorCode.mock.calls[0][0];
    expect(mocks.sendTwoFactorCode.mock.calls[0][0].user.email).toBe(
      "old@mail.org",
    );
    expect(
      (
        await auth.api.verifyTwoFactorOTP({
          body: { code },
          headers: login.headers,
        })
      ).token,
    ).toBeTruthy();

    mocks.sendTwoFactorCode.mockClear();
    db.user[0].email = "0b6e6f2e-7c4e-4a43-9d0f-2f7f3b1d9b11@no-email.invalid";
    db.user[0].emailVerified = false;

    const placeholder = await passwordLogin();
    expect(placeholder.response.twoFactorMethods).toEqual(["backup"]);
    await auth.api.sendTwoFactorOTP({ body: {}, headers: placeholder.headers });
    expect(mocks.sendTwoFactorCode).not.toHaveBeenCalled();
  });

  it("doesn't turn two-factor off on a password reset", async () => {
    await setUpTotp();

    const { mail } = await collectAuthMail(() =>
      auth.api.requestPasswordReset({ body: { email: "old@mail.org" } }),
    );
    await auth.api.resetPassword({
      body: { newPassword: "a-long-new-password", token: mail[0].token },
    });

    expect(db.user[0].twoFactorEnabled).toBe(true);
    expect(
      (await passwordLogin("Old User", "a-long-new-password")).response
        .twoFactorRedirect,
    ).toBe(true);
  });
});

describe("two-factor and passkey config", () => {
  it("rate limits the second-factor and passkey endpoints", () => {
    expect(authOptions.rateLimit.customRules["/two-factor/*"]).toEqual({
      window: 60,
      max: 5,
    });
    expect(authOptions.rateLimit.customRules["/passkey/*"]).toBeTruthy();
  });

  it("keeps management on the server and login steps over http", () => {
    for (const path of [
      "/two-factor/enable",
      "/two-factor/disable",
      "/two-factor/generate-backup-codes",
      "/two-factor/get-totp-uri",
      "/passkey/list-user-passkeys",
      "/passkey/delete-passkey",
      "/passkey/update-passkey",
    ]) {
      expect(authOptions.disabledPaths).toContain(path);
    }
    for (const path of [
      "/sign-in/username",
      "/sign-in/email",
      "/sign-out",
      "/get-session",
      "/two-factor/send-otp",
      "/two-factor/verify-totp",
      "/two-factor/verify-otp",
      "/two-factor/verify-backup-code",
      "/passkey/generate-register-options",
      "/passkey/verify-registration",
      "/passkey/generate-authenticate-options",
      "/passkey/verify-authentication",
    ]) {
      expect(authOptions.disabledPaths).not.toContain(path);
    }
  });

  it("needs a recent login to add a passkey", () => {
    expect(authOptions.session.freshAge).toBe(10 * 60);
  });
});
