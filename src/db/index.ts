import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const globalForDb = globalThis as typeof globalThis & {
  rolviseSql?: postgres.Sql;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for the Rolvise backend.');
  }

  return databaseUrl;
}

export const sql =
  globalForDb.rolviseSql ??
  postgres(getDatabaseUrl(), {
    max: process.env.NODE_ENV === 'production' ? 10 : 1,
    prepare: false
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.rolviseSql = sql;
}

export const db = drizzle(sql, { schema });
