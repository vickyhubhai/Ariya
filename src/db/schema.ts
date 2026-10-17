import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * Short-lived server-side cache for public GitHub metadata.
 *
 * This is the only reason the project touches PostgreSQL: it keeps the site
 * inside the unauthenticated GitHub API rate limit (60 requests/hour/IP) and
 * lets the site serve the last known good release metadata while GitHub is
 * unreachable. No personal data, session or user identifiers are stored.
 */
export const apiCache = pgTable("ariya_api_cache", {
  key: text("key").primaryKey(),
  payload: jsonb("payload").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ApiCacheRow = typeof apiCache.$inferSelect;
