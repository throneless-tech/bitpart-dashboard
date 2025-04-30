// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// import { handlers, auth } from "@/auth";

export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
