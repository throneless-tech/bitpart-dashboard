import { beforeEach, describe, expect, it, vi } from "vitest";
import { passwordSignIn } from "./passwordSignIn";

const ok = { data: { user: { id: "u1" } }, error: null };
const bad = { data: null, error: { status: 401, message: "Invalid" } };

let signIn;

beforeEach(() => {
  signIn = { email: vi.fn(async () => ok), username: vi.fn(async () => ok) };
});

describe("passwordSignIn", () => {
  it("signs in by username", async () => {
    expect(await passwordSignIn(signIn, "alice", "pw")).toBe(ok);
    expect(signIn.username).toHaveBeenCalledWith({
      username: "alice",
      password: "pw",
    });
    expect(signIn.email).not.toHaveBeenCalled();
  });

  it("signs in by email", async () => {
    await passwordSignIn(signIn, "alice@mail.org", "pw");

    expect(signIn.email).toHaveBeenCalledWith({
      email: "alice@mail.org",
      password: "pw",
    });
    expect(signIn.username).not.toHaveBeenCalled();
  });

  it("falls back to a username containing @", async () => {
    signIn.email.mockResolvedValue(bad);

    expect(await passwordSignIn(signIn, "al@ice", "pw")).toBe(ok);
    expect(signIn.username).toHaveBeenCalled();
  });

  it("passes the second-factor step on", async () => {
    const twoFactor = {
      data: { twoFactorRedirect: true, twoFactorMethods: ["totp"] },
      error: null,
    };
    signIn.username.mockResolvedValue(twoFactor);

    expect(await passwordSignIn(signIn, "alice", "pw")).toBe(twoFactor);
  });

  it("never signs in with a placeholder email", async () => {
    signIn.username.mockResolvedValue(bad);

    const result = await passwordSignIn(
      signIn,
      "0b6e6f2e-7c4e-4a43-9d0f-2f7f3b1d9b11@no-email.invalid",
      "pw",
    );

    expect(result.error).toBeTruthy();
    expect(signIn.email).not.toHaveBeenCalled();
  });

  it("needs both fields", async () => {
    expect((await passwordSignIn(signIn, "", "pw")).error).toBeTruthy();
    expect((await passwordSignIn(signIn, "alice", "")).error).toBeTruthy();
    expect(signIn.username).not.toHaveBeenCalled();
  });
});
