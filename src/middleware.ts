import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  const url = request.nextUrl.clone();

  console.log(`[Middleware] Checking path: ${url.pathname}`);
  console.log(`[Middleware] Session Token found: ${!!sessionToken}`);

  // Simulated JWT decode: In production, verify the actual JWT signature/payload here
  const isAdmin = sessionToken ? sessionToken.includes('info.ptmprime@gmail.com') : false;

  // 1. Unauthenticated users cannot access /dashboard or /admin -> Route to Login
  if (!sessionToken && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin'))) {
    console.log(`[Middleware] Blocked unauthenticated access to ${url.pathname}, redirecting to /`);
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users on the Login page (/) -> Route to their respective dashboard
  if (sessionToken && url.pathname === '/') {
    const targetPath = isAdmin ? '/admin' : '/dashboard';
    console.log(`[Middleware] Authenticated user on root, redirecting to ${targetPath}`);
    url.pathname = targetPath;
    return NextResponse.redirect(url);
  }

  // 3. Standard users cannot access /admin -> Route to /dashboard (403 fallback)
  if (sessionToken && url.pathname.startsWith('/admin') && !isAdmin) {
    console.log(`[Middleware] Standard user attempted admin access, redirecting to /dashboard`);
    url.pathname = '/dashboard';
    // You could optionally pass a query param ?error=403 to trigger a toast here
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware only to these routes to optimize performance
export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*'],
};
