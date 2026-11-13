import { beforeAll, describe, expect, it } from "vitest";
import { APIError } from "better-auth/api";
import { setUpTestTelemetry } from "./otel.testing";
import {
  loginMethod,
  loginOutcome,
  loginTelemetry,
  recordRateLimitedLogin,
} from "./authTelemetry";

const apiError = (status, code) =>
  new APIError(status, { code, message: code });

describe("login classification", () => {
  it("names the method from the path", () => {
    expect(loginMethod("/sign-in/email")).toBe("password");
    expect(loginMethod("/sign-in/username")).toBe("password");
    expect(loginMethod("/two-factor/verify-totp")).toBe("totp");
    expect(loginMethod("/two-factor/verify-otp")).toBe("email_code");
    expect(loginMethod("/two-factor/verify-backup-code")).toBe("backup_code");
    expect(loginMethod("/passkey/verify-authentication")).toBe("passkey");
    expect(loginMethod("/get-session")).toBeNull();
  });

  it("works out the outcome", () => {
    expect(loginOutcome("password", { token: "t", user: {} })).toBe("ok");
    expect(
      loginOutcome("password", {
        twoFactorRedirect: true,
        twoFactorMethods: ["totp"],
      }),
    ).toBe("second_factor_required");
    expect(
      loginOutcome(
        "password",
        apiError("UNAUTHORIZED", "INVALID_USERNAME_OR_PASSWORD"),
      ),
    ).toBe("invalid_credentials");
    expect(
      loginOutcome("passkey", apiError("BAD_REQUEST", "AUTHENTICATION_FAILED")),
    ).toBe("invalid_credentials");
    expect(loginOutcome("totp", apiError("UNAUTHORIZED", "INVALID_CODE"))).toBe(
      "invalid_code",
    );
    expect(
      loginOutcome("email_code", apiError("BAD_REQUEST", "OTP_HAS_EXPIRED")),
    ).toBe("invalid_code");
    expect(
      loginOutcome(
        "totp",
        apiError("TOO_MANY_REQUESTS", "ACCOUNT_TEMPORARILY_LOCKED"),
      ),
    ).toBe("locked");
    expect(
      loginOutcome(
        "backup_code",
        apiError("BAD_REQUEST", "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE"),
      ),
    ).toBe("locked");
    expect(
      loginOutcome("password", apiError("INTERNAL_SERVER_ERROR", "X")),
    ).toBe("error");
  });
});

describe("login counting", () => {
  let telemetry;

  beforeAll(() => {
    telemetry = setUpTestTelemetry();
  });

  it("counts each login step from the hook, and rate limits from the route", async () => {
    const [hook] = loginTelemetry().hooks.after;
    const run = (path, returned) =>
      hook.handler({
        path,
        body: { username: "alice", password: "pw" },
        context: { returned },
      });

    expect(hook.matcher({ path: "/sign-in/username" })).toBe(true);
    expect(hook.matcher({ path: "/sign-up/email" })).toBe(false);

    await run("/sign-in/username", { twoFactorRedirect: true });
    await run("/two-factor/verify-totp", { token: "t", user: { id: "u1" } });
    await run("/sign-in/email", apiError("UNAUTHORIZED", "INVALID"));
    recordRateLimitedLogin("/sign-in/username");
    recordRateLimitedLogin("/get-session");

    const points = (await telemetry.collect())["dashboard.logins"];
    expect(points.map((p) => [p.attributes, p.value])).toEqual([
      [{ method: "password", outcome: "second_factor_required" }, 1],
      [{ method: "totp", outcome: "ok" }, 1],
      [{ method: "password", outcome: "invalid_credentials" }, 1],
      [{ method: "password", outcome: "rate_limited" }, 1],
    ]);
    // never the username
    expect(JSON.stringify(points)).not.toContain("alice");
  });
});
