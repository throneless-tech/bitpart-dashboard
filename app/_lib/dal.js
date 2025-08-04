import "server-only";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  // const session = await decrypt(cookie)
  // FIXME
  const session = cookie;

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    return user.username;
  } catch (error) {
    console.log("Failed to fetch user");
    return null;
  }
});
