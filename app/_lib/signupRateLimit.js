import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MINUTES = 60;

const settings = () => ({
  max: Number(process.env.SIGNUP_RATE_LIMIT_MAX) || DEFAULT_MAX,
  windowMs:
    (Number(process.env.SIGNUP_RATE_LIMIT_WINDOW_MINUTES) ||
      DEFAULT_WINDOW_MINUTES) *
    60 *
    1000,
});

// the client's IP address from x-forwarded-for. each trusted reverse proxy
// appends the address that connected to it, so with N proxies in front of the
// app the client is the Nth entry from the end; anything before that could
// have been made up by the client. TRUSTED_PROXY_HOPS sets N (default 1).
//
// with no proxy at all, next fills in the header only when the request didn't
// send one, so a client can pick its own address. run behind a proxy that
// sets x-forwarded-for for the limit to hold.
export const clientIp = (headers) => {
  const forwarded = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  const hops = Math.max(Number(process.env.TRUSTED_PROXY_HOPS) || 1, 1);

  // fewer entries than proxies means the request didn't come through them
  return forwarded.length >= hops ? forwarded[forwarded.length - hops] : null;
};

// requests whose address can't be worked out share one bucket, so a
// misconfigured proxy setting slows sign-ups down instead of switching the
// limit off
const UNKNOWN_IP = "unknown";

// stored instead of the address so the table holds no personal data
const ipHash = (ip) => {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return crypto
    .createHmac("sha256", process.env.AUTH_SECRET)
    .update(ip)
    .digest("hex");
};

// true if another sign-up from this IP is allowed right now
export const signupAllowed = async (ip) => {
  if (!ip) {
    console.warn(
      "Could not determine the client IP for sign-up rate limiting; check TRUSTED_PROXY_HOPS.",
    );
  }

  const { max, windowMs } = settings();
  const since = new Date(Date.now() - windowMs);

  // old rows aren't needed by anyone
  await prisma.signupAttempt.deleteMany({
    where: { createdAt: { lt: since } },
  });

  const recent = await prisma.signupAttempt.count({
    where: { ipHash: ipHash(ip || UNKNOWN_IP), createdAt: { gte: since } },
  });

  return recent < max;
};

export const recordSignup = async (ip) =>
  prisma.signupAttempt.create({ data: { ipHash: ipHash(ip || UNKNOWN_IP) } });
