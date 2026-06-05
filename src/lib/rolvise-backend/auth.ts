import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  consumeOAuthState,
  createOAuthState,
  createSession,
  deleteSession,
  getSessionContext,
  upsertDiscordUser
} from './store';
import type { DiscordProfile } from './types';
import { ApiError } from './http';

export const SESSION_COOKIE = 'better-auth.session_token';
const OAUTH_STATE_COOKIE = 'rolvise_oauth_state';

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
const TEN_MINUTES_IN_SECONDS = 60 * 10;

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string | null;
  avatar?: string | null;
  email?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function getDiscordRedirectUri(requestUrl: string) {
  return (
    process.env.DISCORD_REDIRECT_URI ?? `${new URL(requestUrl).origin}/api/auth/discord/callback`
  );
}

function normalizeRedirectTo(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard/servers';
}

function getDevDiscordProfile(code: string): {
  profile: DiscordProfile;
  email: string | null;
} {
  const discordId =
    /^[0-9]{17,20}$/.test(code) && code !== 'dev'
      ? code
      : (process.env.ROLVISE_DEV_DISCORD_ID ?? '123456789012345678');
  const username = process.env.ROLVISE_DEV_DISCORD_USERNAME ?? 'erlc_manager';
  const globalName = process.env.ROLVISE_DEV_DISCORD_GLOBAL_NAME ?? 'ER:LC Manager';

  return {
    profile: {
      id: discordId,
      username,
      globalName,
      discriminator: null,
      avatarUrl: null
    },
    email: process.env.ROLVISE_DEV_DISCORD_EMAIL ?? 'manager@example.com'
  };
}

async function exchangeDiscordCode(code: string, requestUrl: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return getDevDiscordProfile(code);
  }

  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: getDiscordRedirectUri(requestUrl)
    })
  });

  if (!tokenResponse.ok) {
    throw new ApiError('unauthorized', 'Discord login could not be completed.');
  }

  const tokenJson = (await tokenResponse.json()) as unknown;
  if (!isRecord(tokenJson) || !getString(tokenJson.access_token)) {
    throw new ApiError('unauthorized', 'Discord login could not be completed.');
  }

  const accessToken = getString(tokenJson.access_token);

  if (!accessToken) {
    throw new ApiError('unauthorized', 'Discord login could not be completed.');
  }

  const token: DiscordTokenResponse = {
    access_token: accessToken,
    token_type: getString(tokenJson.token_type) ?? 'Bearer',
    expires_in:
      typeof tokenJson.expires_in === 'number' ? tokenJson.expires_in : TEN_MINUTES_IN_SECONDS,
    refresh_token: getString(tokenJson.refresh_token) ?? undefined,
    scope: getString(tokenJson.scope) ?? undefined
  };
  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`
    }
  });

  if (!userResponse.ok) {
    throw new ApiError('unauthorized', 'Discord profile could not be loaded.');
  }

  const discordUser = (await userResponse.json()) as DiscordUserResponse;
  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null;

  return {
    profile: {
      id: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name ?? null,
      discriminator: discordUser.discriminator ?? null,
      avatarUrl
    },
    email: discordUser.email ?? null
  };
}

export function getSessionToken(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value;
}

export function getOptionalSession(request: NextRequest) {
  return getSessionContext(getSessionToken(request));
}

export function requireSession(request: NextRequest) {
  const context = getOptionalSession(request);

  if (!context) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  return context;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: THIRTY_DAYS_IN_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
}

export function createDiscordAuthorization(request: NextRequest, redirectTo: string) {
  const oauthState = createOAuthState(normalizeRedirectTo(redirectTo));
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = getDiscordRedirectUri(request.url);
  const authorizationUrl = clientId
    ? new URL('https://discord.com/oauth2/authorize')
    : new URL('/api/auth/discord/callback', request.url);

  if (clientId) {
    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', redirectUri);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', 'identify email');
  } else {
    authorizationUrl.searchParams.set('code', 'dev');
  }

  authorizationUrl.searchParams.set('state', oauthState.state);

  const response = NextResponse.json({
    authorizationUrl: authorizationUrl.toString(),
    expiresAt: oauthState.expiresAt
  });

  response.cookies.set(OAUTH_STATE_COOKIE, oauthState.state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TEN_MINUTES_IN_SECONDS
  });

  return response;
}

export async function completeDiscordAuthorization(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code || !state) {
    throw new ApiError('bad_request', 'Discord callback is missing code or state.');
  }

  const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (stateCookie && stateCookie !== state) {
    throw new ApiError('bad_request', 'OAuth state is invalid.');
  }

  const oauthState = consumeOAuthState(state);
  const { profile, email } = await exchangeDiscordCode(code, request.url);
  const user = upsertDiscordUser(profile, email);
  const session = createSession(user.id);
  const redirectUrl = new URL(oauthState.redirectTo, request.url);
  const response = NextResponse.redirect(redirectUrl);

  setSessionCookie(response, session.token);
  response.cookies.delete(OAUTH_STATE_COOKIE);

  return response;
}

export function signOut(request: NextRequest) {
  const token = getSessionToken(request);

  if (!token) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  deleteSession(token);
  const response = new NextResponse(null, { status: 204 });
  clearSessionCookie(response);
  return response;
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
