import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __ariyaPgPool?: Pool;
};

// The database is only the optional cache tier: without DATABASE_URL the app runs memory-only.
export const pool = databaseUrl
  ? (globalForDb.__ariyaPgPool ??
    new Pool({
      connectionString: databaseUrl,
    }))
  : null;

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__ariyaPgPool = pool;
}

export const db = pool ? drizzle(pool) : null;
