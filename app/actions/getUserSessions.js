"use server";
import { prisma } from "@/lib/prisma";

export const getUserSessions = async (userId) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
      },
    });

    console.log("SESSIONS FETCHED****", sessions);
    return sessions;
  } catch (e) {
    console.log(e);
  }
};
