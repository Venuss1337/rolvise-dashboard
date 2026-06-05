'use server';

import { cookies } from 'next/headers';

export type MockUser = {
  email: string;
  name: string;
};

const MOCK_SESSION_COOKIE = 'rolvise_mock_session';
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function encodeSession(user: MockUser) {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
}

function decodeSession(value: string): MockUser | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as MockUser;
  } catch {
    return null;
  }
}

export async function getMockSession(): Promise<MockUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(MOCK_SESSION_COOKIE);

  if (!session?.value) {
    return null;
  }

  return decodeSession(session.value);
}

export async function signInWithMockCredentials(values: {
  email: string;
  password: string;
}): Promise<MockUser> {
  const user = {
    email: values.email,
    name: values.email.split('@')[0] || 'ER:LC Manager'
  };
  const cookieStore = await cookies();

  cookieStore.set(MOCK_SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_IN_SECONDS
  });

  return user;
}

export async function signOutMockUser() {
  const cookieStore = await cookies();

  cookieStore.delete(MOCK_SESSION_COOKIE);
}
