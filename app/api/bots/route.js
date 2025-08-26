import { auth } from "@/auth";

export const GET = auth((req) => {
  console.log(req);

  if (req.auth) {
    // TODO getUserBots if auth'd

    return Response.json({ data: "" });
  }

  return Response.json({ message: "Not authenticated" }, { status: 401 });
});

export const POST = auth((req) => {
  if (req.auth) {
    // TODO POST to user bots if auth'd

    return Response.json({ data: "" });
  }

  return Response.json({ message: "Not authenticated" }, { status: 401 });
});

export const PUT = auth((req) => {
  if (req.auth) {
    // TODO PUT to user bots if auth'd

    return Response.json({ data: "" });
  }

  return Response.json({ message: "Not authenticated" }, { status: 401 });
});

export const DELETE = auth((req) => {
  if (req.auth) {
    // TODO DELETE to user bots if auth'd

    return Response.json({ data: "" });
  }

  return Response.json({ message: "Not authenticated" }, { status: 401 });
});
