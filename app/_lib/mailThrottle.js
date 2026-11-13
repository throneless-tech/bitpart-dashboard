import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

// minimum time between two emails of the same kind to the same user
export const TOKEN_THROTTLE = 2 * 60 * 1000;

const throttleId = (purpose, userId) => `mail-throttle:${purpose}:${userId}`;

// true if an email of this kind may go to the user now, and starts the
// throttle; false if one was sent too recently. kept in the verification table.
export const claimMailSlot = async (purpose, userId) => {
  const identifier = throttleId(purpose, userId);

  const recent = await prisma.verification.findFirst({
    where: { identifier, expiresAt: { gt: new Date() } },
  });

  if (recent) {
    return false;
  }

  await prisma.$transaction([
    prisma.verification.deleteMany({ where: { identifier } }),
    prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier,
        value: userId,
        expiresAt: new Date(Date.now() + TOKEN_THROTTLE),
      },
    }),
  ]);

  return true;
};

export const clearMailThrottle = async (purpose, userId) =>
  prisma.verification.deleteMany({
    where: { identifier: throttleId(purpose, userId) },
  });

// remove the user's outstanding password reset tokens (better auth stores
// them as reset-password:<token> with the user id as value), except one
export const clearResetTokens = async (userId, exceptToken) =>
  prisma.verification.deleteMany({
    where: {
      value: userId,
      identifier: {
        startsWith: "reset-password:",
        ...(exceptToken ? { not: `reset-password:${exceptToken}` } : {}),
      },
    },
  });
