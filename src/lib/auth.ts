import { db } from '@/db';
import { schema } from '@/db/schema';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

function envOrDevelopment(name: string, developmentValue: string) {
  const value = process.env[name];

  if (
    !value &&
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    throw new Error(`${name} is required.`);
  }

  return value ?? developmentValue;
}

function baseUrl() {
  const value = process.env.BETTER_AUTH_URL;

  if (value) {
    return value;
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    throw new Error('BETTER_AUTH_URL is required.');
  }

  return 'http://localhost:3000';
}

export const auth = betterAuth({
  appName: 'Rolvise',
  baseURL: baseUrl(),
  secret: envOrDevelopment('BETTER_AUTH_SECRET', 'development-better-auth-secret-change-me'),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  emailAndPassword: {
    enabled: false
  },
  socialProviders: {
    discord: {
      clientId: envOrDevelopment('DISCORD_CLIENT_ID', 'development-discord-client-id'),
      clientSecret: envOrDevelopment('DISCORD_CLIENT_SECRET', 'development-discord-client-secret'),
      redirectURI: process.env.DISCORD_REDIRECT_URI
    }
  },
  plugins: [nextCookies()]
});
