import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// pages that need a logged in user. only checks the cookie is there; the
// pages check the session itself with auth().
const protectedPaths = ["/create", "/edit", "/my-bots", "/settings", "/view"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedPaths.includes(pathname) && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
