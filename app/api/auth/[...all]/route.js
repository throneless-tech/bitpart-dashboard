import { toNextJsHandler } from "better-auth/next-js";
import { betterAuthServer } from "@/auth";
import { setSpanAttributes } from "@/app/_lib/otel";
import { recordRateLimitedLogin } from "@/app/_lib/authTelemetry";

const { GET: get, POST: post } = toNextJsHandler(betterAuthServer);

// the better auth path (no query string) and status on the request's span
const traced = (handler) => async (request) => {
  const path = new URL(request.url).pathname.replace(/^\/api\/auth/, "");
  const response = await handler(request);

  setSpanAttributes({
    "auth.path": path,
    "http.response.status_code": response.status,
  });

  // the rate limiter's own response (a locked account is a 429 too, but
  // goes through the hooks)
  if (response.status === 429 && response.headers.has("X-Retry-After")) {
    recordRateLimitedLogin(path);
  }

  return response;
};

export const GET = traced(get);
export const POST = traced(post);
