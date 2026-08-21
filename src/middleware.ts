import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const PROTECTED_PATHS = ['/chat'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check auth from cookie (we'll also set a cookie on login for middleware access)
  const token = request.cookies.get('chat_token')?.value;

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login
  if (PUBLIC_PATHS.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Redirect root to chat (or login if not authed)
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
    // Let the root page handle its own rendering (landing page)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
