// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// import { handlers, auth } from "@/auth";

// export { auth as middleware } from "@/auth";

import authConfig from "@/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

const authRoutes = [
  "/",
  "/about",
  "/faq",
  "/login",
  "/signup",
  "/tou-and-privacy",
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname);
  const isApiAuthRouter = req.nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRouter) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/home", req.nextUrl));
    }
    return;
  }
  if (!isLoggedIn && !isAuthRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
