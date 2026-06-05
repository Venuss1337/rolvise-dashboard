import { db } from '@/db';
import { schema } from '@/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

function envOrDevelopment(name: string, developmentValue: string) {
  const value = process.env[name];

  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`${name} is required.`);
  }

  return value ?? developmentValue;
}

export const auth = betterAuth({
  appName: 'Rolvise',
  baseURL: process.env.BETTER_AUTH_URL,
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
