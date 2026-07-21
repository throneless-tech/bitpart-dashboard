import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  createUser: vi.fn(),
  findInviteCode: vi.fn(),
  updateInviteCode: vi.fn(),
  redirect: vi.fn((path) => path),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: mocks.findFirst,
      create: mocks.createUser,
    },
    inviteCode: {
      findUnique: mocks.findInviteCode,
      update: mocks.updateInviteCode,
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { register } from "./register";

const buildFormData = ({ username, password, email, code }) => {
  const formData = new FormData();
  formData.set("username", username ?? "");
  formData.set("password", password ?? "");
  formData.set("passwordConfirm", password ?? "");
  formData.set("email", email ?? "");
  formData.set("code", code ?? "");
  return formData;
};

beforeEach(() => {
  // no existing user, valid unused invite code, successful writes by default
  mocks.findFirst.mockResolvedValue(null);
  mocks.findInviteCode.mockResolvedValue({ code: "INVITE", used: false });
  mocks.updateInviteCode.mockResolvedValue({ code: "INVITE", used: true });
  mocks.createUser.mockResolvedValue({ id: "user-1" });
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
        password: "password123",
        email: "",
        code: "INVITE",
      }),
    );

    expect(mocks.createUser).toHaveBeenCalledTimes(1);
    expect(mocks.createUser.mock.calls[0][0].data.email).toBeNull();
  });

  it("does not query by email when the email field is blank", async () => {
    await register(
      undefined,
      buildFormData({
        username: "alice",
        password: "password123",
        email: "",
        code: "INVITE",
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
        password: "password123",
        email: "alice@mail.org",
        code: "INVITE",
      }),
    );

    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.OR).toContainEqual({ email: "alice@mail.org" });
    expect(where.OR).toContainEqual({ username: "alice" });
  });

  it("succeeds with a blank email even if other email-less accounts exist", async () => {
    // the duplicate check must not match on a shared-blank email
    const result = await register(
      undefined,
      buildFormData({
        username: "bob",
        password: "password123",
        email: "",
        code: "INVITE",
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
        password: "password123",
        email: "",
        code: "INVITE",
      }),
    );

    expect(result.error.username).toBe(
      "A user with these credentials already exists.",
    );
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
});
