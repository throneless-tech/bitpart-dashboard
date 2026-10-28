import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export const TOKEN_TTL = {
  "reset-password": 60 * 60 * 1000,
  "verify-email": 24 * 60 * 60 * 1000,
};

// minimum time between two emails of the same kind to the same user
export const TOKEN_THROTTLE = 2 * 60 * 1000;

const hash = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

const identifier = (purpose, userId) => `${purpose}:${userId}`;

// create a single-use token, replacing any older one for the same purpose and
// user. returns the raw token for the emailed link, or null if one was issued
// too recently. only a hash is stored.
export const createToken = async (purpose, userId) => {
  const ttl = TOKEN_TTL[purpose];

  if (!ttl) {
    throw new Error(`Unknown token purpose: ${purpose}`);
  }

  const id = identifier(purpose, userId);

  const latest = await prisma.verificationToken.findFirst({
    where: { identifier: id },
    orderBy: { expires: "desc" },
  });

  if (latest && latest.expires.getTime() - ttl > Date.now() - TOKEN_THROTTLE) {
    return null;
  }

  const raw = crypto.randomBytes(32).toString("base64url");

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: id } }),
    prisma.verificationToken.create({
      data: {
        identifier: id,
        token: hash(raw),
        expires: new Date(Date.now() + ttl),
      },
    }),
  ]);

  return raw;
};

// consume a token: returns the user id it was issued for, or null if it is
// unknown, expired, already used, or for a different purpose
export const consumeToken = async (purpose, raw) => {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  const record = await prisma.verificationToken.findFirst({
    where: { token: hash(raw) },
  });

  if (!record || !record.identifier.startsWith(`${purpose}:`)) {
    return null;
  }

  // delete first so the same token can't be used twice concurrently
  const { count } = await prisma.verificationToken.deleteMany({
    where: { identifier: record.identifier, token: record.token },
  });

  if (count !== 1 || record.expires.getTime() < Date.now()) {
    return null;
  }

  return record.identifier.slice(purpose.length + 1);
};

// remove any outstanding tokens for a purpose and user
export const clearTokens = async (purpose, userId) =>
  prisma.verificationToken.deleteMany({
    where: { identifier: identifier(purpose, userId) },
  });
