import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes — skip auth check
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // For protected routes, we rely on client-side auth checks
  // since Supabase JS uses cookies/localStorage on client only.
  // Middleware just redirects root to login.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/siswa/:path*', '/login', '/register'],
};
