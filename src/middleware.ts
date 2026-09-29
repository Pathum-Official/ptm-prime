import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We migrated from Cookies to Bearer tokens (localStorage).
  // Next.js middleware cannot read localStorage. 
  // Authentication is now handled client-side in the page.tsx components.
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
