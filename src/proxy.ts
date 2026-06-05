import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_ALIASES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
  'better-auth-session_token',
  '__Secure-better-auth-session_token'
];

function hasBetterAuthSession(req: NextRequest) {
  return req.cookies
    .getAll()
    .some((cookie) =>
      SESSION_COOKIE_ALIASES.some(
        (name) => cookie.name === name || cookie.name.startsWith(`${name}.`)
      )
    );
}

export default function proxy(req: NextRequest) {
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const hasSession = hasBetterAuthSession(req);

  if (isDashboardRoute && !hasSession) {
    const signInUrl = new URL('/auth/sign-in', req.url);

    signInUrl.searchParams.set('auth', 'missing-session');
    signInUrl.searchParams.set('next', `${req.nextUrl.pathname}${req.nextUrl.search}`);

    return NextResponse.redirect(signInUrl);
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
