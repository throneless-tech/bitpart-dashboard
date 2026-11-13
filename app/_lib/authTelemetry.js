import { createAuthMiddleware } from "better-auth/api";
import { count, setSpanAttributes } from "@/app/_lib/otel";
import { logger } from "@/app/_lib/logger";
import { recordAccountEvent } from "@/app/_lib/events";

// counts login attempts (dashboard.logins) from better auth's hooks. the
// username tried is never recorded.

const LOGIN_METHODS = {
  "/sign-in/email": "password",
  "/sign-in/username": "password",
  "/two-factor/verify-totp": "totp",
  "/two-factor/verify-otp": "email_code",
  "/two-factor/verify-backup-code": "backup_code",
  "/passkey/verify-authentication": "passkey",
};

export const loginMethod = (path) => LOGIN_METHODS[path] ?? null;

const isAPIError = (value) =>
  value instanceof Error && typeof value.statusCode === "number";

// how a login step ended, from what the endpoint returned (a response body
// or an APIError)
export const loginOutcome = (method, returned) => {
  if (!isAPIError(returned)) {
    return returned?.twoFactorRedirect ? "second_factor_required" : "ok";
  }

  const status = returned.statusCode;
  const code = returned.body?.code ?? "";

  if (code === "ACCOUNT_TEMPORARILY_LOCKED" || /TOO_MANY_ATTEMPTS/.test(code)) {
    return "locked";
  }

  if (status === 429) {
    return "rate_limited";
  }

  if (status >= 500) {
    return "error";
  }

  // a wrong, expired or unknown code, or a missing 2fa challenge
  if (method !== "password" && method !== "passkey") {
    return "invalid_code";
  }

  return "invalid_credentials";
};

export const recordLogin = ({ method, outcome, userId }) => {
  count("dashboard.logins", { method, outcome });
  setSpanAttributes({ "auth.method": method, "auth.outcome": outcome });

  if (outcome === "ok") {
    logger.info({ "user.id": userId, method }, "login");
  } else if (outcome !== "second_factor_required") {
    logger.warn({ method, outcome }, "login failed");
  }
};

// better auth plugin: an after hook on every login step
export const loginTelemetry = () => ({
  id: "bitpart-login-telemetry",
  hooks: {
    after: [
      {
        matcher: (ctx) => !!loginMethod(ctx.path),
        handler: createAuthMiddleware(async (ctx) => {
          const method = loginMethod(ctx.path);
          const returned = ctx.context.returned;

          recordLogin({
            method,
            outcome: loginOutcome(method, returned),
            userId: isAPIError(returned) ? undefined : returned?.user?.id,
          });
        }),
      },
      {
        // passkeys are added from the browser, not a server action
        matcher: (ctx) => ctx.path === "/passkey/verify-registration",
        handler: createAuthMiddleware(async (ctx) => {
          const returned = ctx.context.returned;

          if (returned && !isAPIError(returned)) {
            recordAccountEvent("passkey_added", returned.userId);
          }
        }),
      },
    ],
  },
});

// requests the rate limiter turns away never reach the hooks, so the route
// handler counts those
export const recordRateLimitedLogin = (path) => {
  const method = loginMethod(path);

  if (method) {
    recordLogin({ method, outcome: "rate_limited" });
  }
};
