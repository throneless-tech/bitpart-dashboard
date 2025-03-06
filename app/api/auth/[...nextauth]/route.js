import { NextResponse, NextRequest } from 'next/server';
import { handlers, auth } from "@/auth";

export const { POST } = handlers;

export const GET = auth((req) => {

  console.log('============================');
  console.log(req.auth);

  console.log('============================');

  if (req.auth) {
    return NextResponse.next();
  }

  // Redirect to login page if not authenticated
  return NextResponse.redirect(new URL('/error?error=NotAuthorized', req.url))
})