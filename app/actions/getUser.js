"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getUser = async (username) => {
  const session = await auth();
  const sessionUsername = session?.user?.name;

  if (sessionUsername !== username) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return user;
};
