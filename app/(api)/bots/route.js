import { auth } from "@/auth";

export const GET = auth((req) => {
  if (req.auth) {
    // TODO getUserBots if auth'd

    return Response.json({ data: "" });
  }

  return Response.json({ message: "Not authenticated" }, { status: 401 });
});
