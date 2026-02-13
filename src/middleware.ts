
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Since we're using Firebase Client SDK for Auth, we usually check a session cookie
  // or handle protection on the client-side for simplicity in some starters.
  // However, for a real app, we use Firebase Admin SDK or check for a specific auth cookie.
  // For this implementation, we will perform client-side protection within a layout wrapper
  // but this middleware can serve as a placeholder for SSR protection.
  
  const { pathname } = request.nextUrl;
  
  // Basic redirect logic if needed
  if (pathname.startsWith('/admin') && !request.cookies.has('fb-token')) {
    // In a real prod app, you'd set this cookie after signing in.
    // return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
