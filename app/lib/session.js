import cookies from "next/headers";
import { db } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function createSession(id) {
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  // 1. Create a session in the database
  const data = await prisma.user.create({
    data: {
      userId: id,
      expires,
    },
  });

  const sessionId = data.id;

  // 2. Encrypt the session ID
  const session = bcrypt.hash({ sessionId, expires }, 10);
  // FIXME
  // const session = { sessionId, expires };

  // 3. Store the session in cookies for optimistic auth checks
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires,
    sameSite: "lax",
    path: "/",
  });
}
