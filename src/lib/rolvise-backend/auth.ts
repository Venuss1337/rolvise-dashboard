import { auth } from '@/lib/auth';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from './http';

export const SESSION_COOKIE = 'better-auth.session_token';

type BetterAuthSessionContext = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

function normalizeRedirectTo(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard/servers';
}

function copyAuthHeaders(source: Response, target: NextResponse) {
  source.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      target.headers.append(key, value);
    }
  });
}

export async function getOptionalSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers
  });
}

export async function requireSession(request: NextRequest): Promise<BetterAuthSessionContext> {
  const context = await getOptionalSession(request);

  if (!context) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  return context;
}

export async function createDiscordAuthorization(request: NextRequest, redirectTo: string) {
  const body = {
    provider: 'discord',
    callbackURL: normalizeRedirectTo(redirectTo),
    errorCallbackURL: '/auth/sign-in',
    disableRedirect: true
  };
  const signInUrl = new URL('/api/auth/sign-in/social', request.url);
  const response = await auth.handler(
    new Request(signInUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: request.nextUrl.origin
      },
      body: JSON.stringify(body)
    })
  );
  const payload = (await response.json()) as { url?: string };

  if (!response.ok || !payload.url) {
    throw new ApiError('bad_request', 'Discord authorization URL could not be created.');
  }

  const adaptedResponse = NextResponse.json({
    authorizationUrl: payload.url
  });

  copyAuthHeaders(response, adaptedResponse);

  return adaptedResponse;
}

export async function completeDiscordAuthorization(request: NextRequest) {
  const callbackUrl = new URL(request.url);
  callbackUrl.pathname = '/api/auth/callback/discord';

  return auth.handler(new Request(callbackUrl, request));
}

export async function signOut(request: NextRequest) {
  const context = await getOptionalSession(request);

  if (!context) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  const signOutUrl = new URL('/api/auth/sign-out', request.url);
  const response = await auth.handler(
    new Request(signOutUrl, {
      method: 'POST',
      headers: request.headers
    })
  );
  const emptyResponse = new NextResponse(null, { status: 204 });

  copyAuthHeaders(response, emptyResponse);

  return emptyResponse;
}

export function requireBotBearer(request: NextRequest) {
  const expectedToken = process.env.ROLVISE_BOT_API_TOKEN ?? 'development-bot-token';
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token || token !== expectedToken) {
    throw new ApiError('bot_unauthorized', 'Bot request could not be verified.');
  }
}

export function requireBotSignature(request: NextRequest, rawBody: string) {
  requireBotBearer(request);

  const secret = process.env.ROLVISE_BOT_CALLBACK_SECRET ?? 'development-bot-secret';
  const signature = request.headers.get('x-rolvise-signature');

  if (!signature) {
    throw new ApiError('bot_unauthorized', 'Bot request could not be verified.');
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const normalizedSignature = signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature;

  const expectedBuffer = Buffer.from(expected, 'hex');
  const actualBuffer = Buffer.from(normalizedSignature, 'hex');

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    throw new ApiError('bot_unauthorized', 'Bot request could not be verified.');
  }
}
