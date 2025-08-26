"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export const updateUserConsent = async (username) => {
  const updateUser = await prisma.user.update({
    where: {
      username,
    },
    data: {
      consent_agree: true,
    },
  });

  revalidatePath("my-bots");

  return updateUser;
};
