import { cachedJson } from "./cache";
import { isAllowedNewsImage, newsImageProxyUrl } from "./news-image";
import { repo } from "./site";

export { isAllowedNewsImage, newsImageProxyUrl } from "./news-image";

/**
 * Developer news is published in https://github.com/vickyhubhai/Ariya_news
 *
 * Repository structure (verified against the Contents API):
 *   metadata.json          -> array of { id, Title, Description, Author, Date, ImageURL, Important }
 *   content/<id>.md        -> the full post, GitHub-flavoured Markdown
 *
 * Posts are read from the default branch over raw.githubusercontent.com, which
 * is not subject to the GitHub API rate limit. Ids are validated before use.
 */

export type NewsErrorCode = "offline" | "timeout" | "network" | "not_found" | "invalid_data" | "http";

export class NewsApiError extends Error {
  code: NewsErrorCode;

  constructor(message: string, code: NewsErrorCode) {
    super(message);
    this.name = "NewsApiError";
    this.code = code;
  }
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  dateLabel: string;
  important: boolean;
  image: string | null;
  githubUrl: string;
  contentFile: string;
}

export interface NewsList {
  generatedAt: string;
  posts: NewsPost[];
}

export type NewsResult<T> =
  | { ok: true; data: T; stale: boolean }
  | { ok: false; error: { code: NewsErrorCode; message: string } };

const BRANCH = "main";
const RAW_ROOT = `https://raw.githubusercontent.com/${repo.newsOwner}/${repo.newsName}/${BRANCH}`;
const TTL = 10 * 60 * 1000;
const TIMEOUT = 9000;
const POST_ID = /^[a-z0-9][a-z0-9-]{2,80}\.md$/i;

interface RawMeta {
  id?: unknown;
  Title?: unknown;
  title?: unknown;
  Description?: unknown;
  description?: unknown;
  Author?: unknown;
  author?: unknown;
  Date?: unknown;
  date?: unknown;
  ImageURL?: unknown;
  important?: unknown;
  Important?: unknown;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}


function toIsoDate(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    // Metadata uses Unix seconds; accept milliseconds defensively.
    const ms = value > 1e12 ? value : value * 1000;
    const date = new Date(ms);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
    return null;
  }
  if (typeof value === "string" && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return toIsoDate(numeric);
  }
  return null;
}

async function fetchText(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "User-Agent": "ariya-music-player-website" },
    });
  } catch (error) {
    const name = (error as { name?: string }).name;
    throw new NewsApiError(
      name === "TimeoutError" || name === "AbortError"
        ? "The news source took too long to respond."
        : "Could not reach the news source.",
      name === "TimeoutError" || name === "AbortError" ? "timeout" : "network",
    );
  }

  if (response.status === 404) {
    throw new NewsApiError("The requested news post was not found.", "not_found");
  }
  if (!response.ok) {
    throw new NewsApiError(`The news source responded with HTTP ${response.status}.`, "http");
  }
  return response.text();
}

function normalisePost(meta: RawMeta): NewsPost | null {
  const id = pickString(meta.id);
  if (!POST_ID.test(id)) return null;
  const title = pickString(meta.Title, meta.title);
  if (!title) return null;
  const date = toIsoDate(meta.Date ?? meta.date) ?? new Date().toISOString();
  const images = Array.isArray(meta.ImageURL) ? meta.ImageURL : [meta.ImageURL];
  const rawImage = images.find((candidate): candidate is string => typeof candidate === "string");
  const description = pickString(meta.Description, meta.description);
  const slug = id.replace(/\.md$/i, "");

  return {
    id,
    slug,
    title,
    description: description || "Ariya developer update from the official Ariya_news repository.",
    author: pickString(meta.Author, meta.author) || repo.newsOwner,
    date,
    dateLabel: new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }),
    important: Boolean(meta.important ?? meta.Important ?? false),
    image: isAllowedNewsImage(rawImage) ? rawImage : null,
    githubUrl: `https://github.com/${repo.newsOwner}/${repo.newsName}/blob/${BRANCH}/content/${id}`,
    contentFile: id,
  };
}

export async function getNewsList(): Promise<NewsResult<NewsList>> {
  try {
    const result = await cachedJson<NewsList>("news:list:v3", TTL, async () => {
      const raw = await fetchText(`${RAW_ROOT}/metadata.json`);
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new NewsApiError("The news metadata could not be parsed.", "invalid_data");
      }
      if (!Array.isArray(parsed)) {
        throw new NewsApiError("The news metadata has an unexpected shape.", "invalid_data");
      }
      const posts = parsed
        .map((item) => normalisePost(item as RawMeta))
        .filter((post): post is NewsPost => post !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { generatedAt: new Date().toISOString(), posts };
    });
    return { ok: true, data: result.data, stale: result.stale };
  } catch (error) {
    return { ok: false, error: toNewsFailure(error) };
  }
}

export async function getNewsPost(slug: string): Promise<NewsResult<{ post: NewsPost; markdown: string }>> {
  const id = slug.endsWith(".md") ? slug : `${slug}.md`;
  if (!POST_ID.test(id)) {
    return { ok: false, error: { code: "not_found", message: "That news post could not be found." } };
  }

  const list = await getNewsList();
  if (!list.ok) return { ok: false, error: list.error };
  const post = list.data.posts.find((candidate) => candidate.id === id);
  if (!post) {
    return { ok: false, error: { code: "not_found", message: "That news post could not be found." } };
  }

  try {
    const result = await cachedJson<{ markdown: string }>(
      `news:post:v3:${id}`,
      TTL,
      async () => ({ markdown: (await fetchText(`${RAW_ROOT}/content/${id}`)).slice(0, 120_000) }),
    );
    return { ok: true, data: { post, markdown: result.data.markdown }, stale: result.stale };
  } catch (error) {
    return { ok: false, error: toNewsFailure(error) };
  }
}

export function toNewsFailure(error: unknown): { code: NewsErrorCode; message: string } {
  if (error instanceof NewsApiError) return { code: error.code, message: error.message };
  return { code: "network", message: "Developer news is temporarily unavailable." };
}

