import { prisma } from "@/lib/prisma";

// middleware runs in the edge runtime, where prisma can't reach the database;
// pages and server actions call auth() in node, where this check runs.
const canQueryDatabase = () => typeof globalThis.EdgeRuntime !== "string";

// jwt callback: record the sessionVersion at sign-in, then end the session if
// the user's password has since been changed or reset, or the user is gone.
export const checkSessionVersion = async ({ token, user }) => {
  if (user) {
    token.sessionVersion = user.sessionVersion ?? 0;
    return token;
  }

  if (!canQueryDatabase() || !token?.sub) {
    return token;
  }

  const current = await prisma.user.findUnique({
    where: { id: token.sub },
    select: { sessionVersion: true },
  });

  if (!current || current.sessionVersion !== (token.sessionVersion ?? 0)) {
    return null;
  }

  return token;
};
