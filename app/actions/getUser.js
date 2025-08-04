"use server";

import { prisma } from "@/lib/prisma";

export const getUser = async (username) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return user;
};
