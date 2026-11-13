import bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: null,
  twoFactor: null,
  password: null,
  getUser: vi.fn(),
  userUpdate: vi.fn(),
  twoFactorUpdate: vi.fn(),
  api: {
    enableTwoFactor: vi.fn(),
    verifyTOTP: vi.fn(),
    disableTwoFactor: vi.fn(),
    generateBackupCodes: vi.fn(),
    updatePasskey: vi.fn(),
    deletePasskey: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    account: {
      findFirst: vi.fn(async ({ where }) =>
        where.userId === mocks.user?.id ? { password: mocks.password } : null,
      ),
    },
    twoFactor: {
      findUnique: vi.fn(async () => mocks.twoFactor),
      update: mocks.twoFactorUpdate.mockImplementation(async ({ data }) =>
        Object.assign(mocks.twoFactor, data),
      ),
    },
    user: {
      update: mocks.userUpdate.mockImplementation(async ({ data }) =>
        Object.assign(mocks.user, data),
      ),
    },
  },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("./getUser", () => ({ getUser: mocks.getUser }));
vi.mock("@/auth", () => ({ betterAuthServer: { api: mocks.api } }));
vi.mock("@/app/_lib/accountEmails", () => ({ sendTwoFactorCode: vi.fn() }));

import {
  confirmTotpSetup,
  deletePasskey,
  disableEmailCodes,
  disableTotp,
  enableEmailCodes,
  regenerateBackupCodes,
  renamePasskey,
  startTotpSetup,
} from "./security";

const form = (fields) => {
  const data = new FormData();
  Object.entries({ username: "alice", ...fields }).forEach(([k, v]) =>
    data.set(k, v),
  );
  return data;
};
const withPassword = (fields = {}) =>
  form({ currentPassword: "old-password", ...fields });
const wrongPassword = () => form({ currentPassword: "wrong" });

const TOTP_URI =
  "otpauth://totp/Bitpart:alice%40mail.org?secret=JBSWY3DPEHPK3PXP&issuer=Bitpart";

beforeEach(async () => {
  mocks.user = {
    id: "user-1",
    username: "alice",
    email: "alice@mail.org",
    emailVerified: true,
    emailOtpEnabled: false,
    twoFactorEnabled: false,
  };
  mocks.twoFactor = null;
  mocks.password = await bcrypt.hash("old-password", 4);
  mocks.getUser.mockImplementation(async (username) =>
    username === "alice" ? mocks.user : null,
  );
  mocks.api.enableTwoFactor.mockImplementation(async () => {
    mocks.twoFactor = {
      verified: false,
      secret: "enc",
      backupCodes: "new-codes",
    };
    return { totpURI: TOTP_URI, backupCodes: ["aaaaa-bbbbb"] };
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("authenticator app", () => {
  it("needs the current password to start", async () => {
    const result = await startTotpSetup(undefined, wrongPassword());

    expect(result.error.currentPassword).toMatch(/incorrect/);
    expect(mocks.api.enableTwoFactor).not.toHaveBeenCalled();
  });

  it("gives a qr code, the key and backup codes", async () => {
    const result = await startTotpSetup(undefined, withPassword());

    expect(mocks.api.enableTwoFactor).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { password: "old-password", method: "totp" },
      }),
    );
    expect(result.totp.qr).toMatch(/^data:image\/png;base64,/);
    expect(result.totp.secret).toBe("JBSWY3DPEHPK3PXP");
    expect(result.backupCodes).toEqual(["aaaaa-bbbbb"]);
  });

  it("keeps existing backup codes when email codes are on", async () => {
    mocks.user.emailOtpEnabled = true;
    mocks.twoFactor = { verified: false, backupCodes: "old-codes" };

    const result = await startTotpSetup(undefined, withPassword());

    expect(result.backupCodes).toBeNull();
    expect(mocks.twoFactor.backupCodes).toBe("old-codes");
  });

  it("confirms with a code", async () => {
    expect(
      (await confirmTotpSetup(undefined, form({ code: " 123456 " }))).success,
    ).toMatch(/on/);
    expect(mocks.api.verifyTOTP).toHaveBeenCalledWith(
      expect.objectContaining({ body: { code: "123456" } }),
    );

    mocks.api.verifyTOTP.mockRejectedValue(new Error("INVALID_CODE"));
    expect(
      (await confirmTotpSetup(undefined, form({ code: "1" }))).error.code,
    ).toMatch(/didn't work/);
  });

  it("turns off only with the password, keeping email codes", async () => {
    mocks.twoFactor = { verified: true, secret: "enc", backupCodes: "c" };
    mocks.user.emailOtpEnabled = true;

    expect((await disableTotp(undefined, wrongPassword())).error).toBeTruthy();
    expect(mocks.twoFactor.verified).toBe(true);

    expect((await disableTotp(undefined, withPassword())).success).toMatch(
      /off/,
    );
    expect(mocks.twoFactor).toMatchObject({
      verified: false,
      secret: "disabled",
      backupCodes: "c",
    });
    expect(mocks.api.disableTwoFactor).not.toHaveBeenCalled();
  });

  it("turns two-factor off when it was the only method", async () => {
    mocks.twoFactor = { verified: true };

    await disableTotp(undefined, withPassword());

    expect(mocks.api.disableTwoFactor).toHaveBeenCalledWith(
      expect.objectContaining({ body: { password: "old-password" } }),
    );
  });
});

describe("email codes", () => {
  it("need the current password", async () => {
    expect(
      (await enableEmailCodes(undefined, wrongPassword())).error
        .currentPassword,
    ).toMatch(/incorrect/);
    expect(mocks.user.emailOtpEnabled).toBe(false);
  });

  it("need a real, confirmed email", async () => {
    mocks.user.emailVerified = false;
    expect(
      (await enableEmailCodes(undefined, withPassword())).error.general,
    ).toMatch(/confirm an email/);

    mocks.user.emailVerified = true;
    mocks.user.email = "0b6e6f2e-7c4e-4a43-9d0f-2f7f3b1d9b11@no-email.invalid";
    expect(
      (await enableEmailCodes(undefined, withPassword())).error.general,
    ).toMatch(/confirm an email/);
    expect(mocks.user.emailOtpEnabled).toBe(false);
  });

  it("turn on with new backup codes, without turning on the app", async () => {
    const result = await enableEmailCodes(undefined, withPassword());

    expect(result.backupCodes).toEqual(["aaaaa-bbbbb"]);
    expect(mocks.user).toMatchObject({
      emailOtpEnabled: true,
      twoFactorEnabled: true,
    });
    expect(mocks.twoFactor.verified).toBe(false);
  });

  it("keep the app's backup codes when it's on", async () => {
    mocks.twoFactor = { verified: true };

    const result = await enableEmailCodes(undefined, withPassword());

    expect(result.backupCodes).toBeNull();
    expect(mocks.api.enableTwoFactor).not.toHaveBeenCalled();
  });

  it("turn off, and two-factor with them if nothing else is on", async () => {
    mocks.user.emailOtpEnabled = true;
    mocks.twoFactor = { verified: false };

    expect(
      (await disableEmailCodes(undefined, wrongPassword())).error,
    ).toBeTruthy();
    expect(mocks.user.emailOtpEnabled).toBe(true);

    await disableEmailCodes(undefined, withPassword());

    expect(mocks.user.emailOtpEnabled).toBe(false);
    expect(mocks.api.disableTwoFactor).toHaveBeenCalled();
  });
});

describe("backup codes", () => {
  it("regenerate with the password", async () => {
    mocks.twoFactor = { verified: true };
    mocks.user.twoFactorEnabled = true;
    mocks.api.generateBackupCodes.mockResolvedValue({
      backupCodes: ["ccccc-ddddd"],
    });

    expect(
      (await regenerateBackupCodes(undefined, wrongPassword())).error,
    ).toBeTruthy();
    expect(mocks.api.generateBackupCodes).not.toHaveBeenCalled();

    const result = await regenerateBackupCodes(undefined, withPassword());
    expect(result.backupCodes).toEqual(["ccccc-ddddd"]);
  });

  it("need a second factor", async () => {
    expect(
      (await regenerateBackupCodes(undefined, withPassword())).error.general,
    ).toMatch(/Turn on/);
  });
});

describe("passkeys", () => {
  it("rename and delete through better auth, which checks ownership", async () => {
    expect(
      (await renamePasskey(undefined, form({ id: "pk1", name: " Laptop " })))
        .success,
    ).toMatch(/renamed/);
    expect(mocks.api.updatePasskey).toHaveBeenCalledWith(
      expect.objectContaining({ body: { id: "pk1", name: "Laptop" } }),
    );

    mocks.api.deletePasskey.mockRejectedValue(new Error("UNAUTHORIZED"));
    expect((await deletePasskey("alice", "someone-elses")).error).toMatch(
      /Couldn't/,
    );
  });

  it("refuse when not logged in as that user", async () => {
    expect((await deletePasskey("bob", "pk1")).error).toMatch(/logged in/);
    expect(
      (
        await renamePasskey(
          undefined,
          form({ username: "bob", id: "pk1", name: "x" }),
        )
      ).error.general,
    ).toMatch(/logged in/);
    expect(mocks.api.deletePasskey).not.toHaveBeenCalled();
    expect(mocks.api.updatePasskey).not.toHaveBeenCalled();
  });
});
