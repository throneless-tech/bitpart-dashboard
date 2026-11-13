import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/app/_actions/getUser";

// the logged in user, checked against their current password. not a server
// action itself, so it can return the user row.
export const getVerifiedUser = async (username, currentPassword) => {
  const user = await getUser(username);

  if (!user) {
    return { error: { general: "You must be logged in to do this." } };
  }

  const account = currentPassword
    ? await prisma.account.findFirst({
        where: { userId: user.id, providerId: "credential" },
      })
    : null;

  if (
    !account?.password ||
    !(await bcrypt.compare(currentPassword, account.password))
  ) {
    return {
      error: { currentPassword: "Your current password is incorrect." },
    };
  }

  return { user };
};
