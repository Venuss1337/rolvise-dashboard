import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'better-auth.session_token';

export default function proxy(req: NextRequest) {
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const hasSession = req.cookies.has(SESSION_COOKIE);

  if (isDashboardRoute && !hasSession) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard/servers', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
