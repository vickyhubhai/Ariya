import { db } from "@/db";
import { apiCache } from "@/db/schema";
import { sql } from "drizzle-orm";

interface CacheEntry {
  payload: unknown;
  fetchedAt: number;
}

const memory = new Map<string, CacheEntry>();
const MEMORY_LIMIT = 24;

/** Stop hammering a missing/unreachable database after the first failure. */
let databaseAvailable = true;

function remember(key: string, entry: CacheEntry) {
  if (memory.size >= MEMORY_LIMIT) {
    const oldest = memory.keys().next().value;
    if (oldest) memory.delete(oldest);
  }
  memory.set(key, entry);
}

async function readDatabase(key: string): Promise<CacheEntry | null> {
  if (!databaseAvailable || !db) return null;
  try {
    const rows = await db
      .select()
      .from(apiCache)
      .where(sql`${apiCache.key} = ${key}`)
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return { payload: row.payload, fetchedAt: new Date(row.fetchedAt).getTime() };
  } catch {
    databaseAvailable = false;
    return null;
  }
}

async function writeDatabase(key: string, payload: unknown): Promise<void> {
  if (!databaseAvailable || !db) return;
  try {
    await db
      .insert(apiCache)
      .values({ key, payload, fetchedAt: new Date() })
      .onConflictDoUpdate({
        target: apiCache.key,
        set: { payload, fetchedAt: new Date() },
      });
  } catch {
    databaseAvailable = false;
  }
}

export interface CachedResult<T> {
  data: T;
  /** True when GitHub failed and a previously cached value was served. */
  stale: boolean;
  fetchedAt: number;
}

/**
 * Read-through cache with three layers: memory -> PostgreSQL -> upstream.
 * A failed upstream request still resolves with stale data when available,
 * so a GitHub outage never takes the page down.
 */
export async function cachedJson<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<CachedResult<T>> {
  const now = Date.now();
  const cached = memory.get(key) ?? (await readDatabase(key));

  if (cached) {
    remember(key, cached);
    if (now - cached.fetchedAt < ttlMs) {
      return { data: cached.payload as T, stale: false, fetchedAt: cached.fetchedAt };
    }
  }

  try {
    const data = await fetcher();
    const entry = { payload: data as unknown, fetchedAt: Date.now() };
    remember(key, entry);
    void writeDatabase(key, data);
    return { data, stale: false, fetchedAt: entry.fetchedAt };
  } catch (error) {
    if (cached) {
      return { data: cached.payload as T, stale: true, fetchedAt: cached.fetchedAt };
    }
    throw error;
  }
}
