import { Debug, discordConfig, githubConfig } from './config';
import { getMetadata } from './news';
import { ApiError, type NewsItem, type Release } from './types';
import { compareVersions, formatSize, formatDate, isOffline, safeUrl, storageGet, storageSet } from './utils';

interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface Embed {
  title: string;
  description?: string;
  color?: number;
  url?: string;
  fields?: EmbedField[];
  footer?: { text: string };
  image?: { url: string };
  timestamp: string;
}

export interface BugReportInput {
  type: 'bug' | 'feedback' | 'question';
  name: string;
  contact: string;
  message: string;
  website: string;
  appVersion: string;
}

function clip(text: unknown, max: number): string {
  const s = String(text == null ? '' : text);
  return s.length > max ? `${s.slice(0, max - 1)}\u2026` : s;
}

/** POSTs to a Discord webhook with the same error codes as the static site. */
async function post(webhookUrl: string, payload: { username: string; embeds: Embed[] }): Promise<true> {
  if (isOffline()) throw new ApiError("You're offline. Check your connection and try again.", 'offline');

  let res: Response;
  try {
    res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, allowed_mentions: { parse: [] } }),
    });
  } catch {
    throw new ApiError('Unable to send. Check your connection and try again.', 'network');
  }

  if (res.status === 429) throw new ApiError('Too many requests. Please wait a moment and try again.', 'rate_limit');
  if (!res.ok) throw new ApiError('Unable to send right now. Please try again later.', 'http');
  return true;
}

function publishedWithinDays(iso: string, days: number): boolean {
  const t = Date.parse(iso || '');
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 86400000;
}

/**
 * Announces a release to the updates webhook once per newer tag.
 * First run only records the current tag (no spam), same as before.
 */
export function announceRelease(release: Release | null): void {
  if (!release || typeof release.version !== 'string' || !release.version) return;

  const key = discordConfig.storageKeys.announcedRelease;
  const stored = storageGet(key);

  if (!stored) {
    storageSet(key, release.version);
    return;
  }
  if (compareVersions(release.version, stored) <= 0) return;

  if (!publishedWithinDays(release.publishedAt, discordConfig.announceIfPublishedWithinDays)) {
    storageSet(key, release.version);
    return;
  }

  const body = String(release.body || '').replace(/\s+/g, ' ').trim();
  const fields: EmbedField[] = [
    { name: 'Version', value: clip(release.version, 256), inline: true },
    { name: 'Size', value: release.apk && release.apk.size ? formatSize(release.apk.size) : 'Unknown', inline: true },
    { name: 'Released', value: formatDate(release.publishedAt), inline: true },
  ];
  if (release.htmlUrl) fields.push({ name: 'Release Page', value: clip(release.htmlUrl, 256), inline: false });

  const embed: Embed = {
    title: clip(`\u{1F680} New Release: ${githubConfig.appName} ${release.version}`, 256),
    description: clip(body || 'A new version is now available.', 500),
    color: 0x7c5cfc,
    fields,
    footer: { text: `${githubConfig.appName} Updates` },
    timestamp: new Date().toISOString(),
  };
  if (release.htmlUrl) embed.url = release.htmlUrl;

  post(discordConfig.updatesWebhook, { username: discordConfig.updatesUsername, embeds: [embed] })
    .then(() => {
      storageSet(key, release.version);
      Debug.log('release announced:', release.version);
    })
    .catch((err: unknown) => Debug.log('release announce failed:', err instanceof ApiError ? err.code : err));
}

function newsTime(item: NewsItem): number {
  const raw = item.Date ?? item.date;
  const t = typeof raw === 'string' ? Number(raw) || Date.parse(raw) : Number(raw);
  if (!Number.isFinite(t) || t <= 0) return 0;
  return t < 1e12 ? t * 1000 : t;
}

function announceNews(item: NewsItem): Promise<true> {
  const embed: Embed = {
    title: clip(item.Title || item.title || 'Ariya News', 256),
    color: 0xa78bfa,
    footer: {
      text: `${githubConfig.appName} News${item.Author ? ` \u2022 ${clip(item.Author, 100)}` : ''}`,
    },
    timestamp: new Date(newsTime(item) || Date.now()).toISOString(),
  };

  const desc = String(item.Description || item.description || '').trim();
  if (desc) embed.description = clip(desc, 800);

  let img: unknown = item.ImageURL;
  if (typeof img === 'string') img = [img];
  if (Array.isArray(img) && img.length) {
    const safe = safeUrl(img[0], ['https:', 'http:']);
    if (safe) embed.image = { url: safe };
  }

  return post(discordConfig.updatesWebhook, { username: discordConfig.updatesUsername, embeds: [embed] }).then(
    () => true as const,
  );
}

/**
 * News watcher: announces items the visitor has not seen yet.
 * First run seeds the seen-set instead of flooding the channel.
 */
export async function checkNewsNow(): Promise<void> {
  if (isOffline()) return;

  let items: NewsItem[];
  try {
    items = await getMetadata({ force: false });
  } catch {
    return;
  }
  if (!Array.isArray(items) || !items.length) return;

  const key = discordConfig.storageKeys.announcedNews;
  const raw = storageGet(key);
  let seen: Set<string>;

  if (!raw) {
    seen = new Set(items.map((i) => i.id));
    storageSet(key, JSON.stringify([...seen].slice(-50)));
    return;
  }

  try {
    const arr = JSON.parse(raw) as unknown;
    seen = new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    seen = new Set();
  }

  const fresh = items.filter((i) => i && i.id && !seen.has(i.id)).sort((a, b) => newsTime(a) - newsTime(b));
  if (!fresh.length) return;

  for (const item of fresh) {
    try {
      await announceNews(item);
      seen.add(item.id);
    } catch (err) {
      Debug.log('news announce failed:', err instanceof ApiError ? err.code : err);
      break;
    }
  }
  storageSet(key, JSON.stringify([...seen].slice(-50)));
}

/** Returns the remaining send-cooldown in ms (0 when free to send). */
export function bugCooldownRemaining(): number {
  const last = Number(storageGet(discordConfig.storageKeys.bugCooldown) || 0);
  if (!last) return 0;
  const left = discordConfig.bugCooldownMs - (Date.now() - last);
  return left > 0 ? left : 0;
}

/**
 * Validates and posts a bug report / feedback / question to the reports
 * webhook. Throws ApiError with a user-facing message, as the form expects.
 */
export async function submitBugReport(input: BugReportInput): Promise<void> {
  const message = String(input.message || '').trim();

  if (input.website) return; // honeypot filled: pretend success, send nothing

  if (message.length < discordConfig.bugMinLength) {
    throw new ApiError(`Please enter at least ${discordConfig.bugMinLength} characters.`, 'http');
  }

  if (bugCooldownRemaining() > 0) {
    throw new ApiError('Please wait a moment before sending another report.', 'rate_limit');
  }

  const labels: Record<BugReportInput['type'], string> = {
    bug: '\u{1F41B} Bug Report',
    feedback: '\u{1F4AC} Feedback',
    question: '\u2753 Question',
  };
  const colors: Record<BugReportInput['type'], number> = {
    bug: 0xf87171,
    feedback: 0x7c5cfc,
    question: 0xfbbf24,
  };

  const type = input.type in labels ? input.type : 'bug';
  const page = typeof window !== 'undefined' ? window.location.href : '';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || 'Unknown' : 'Unknown';
  const language = typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en';

  const fields: EmbedField[] = [
    { name: 'Type', value: labels[type], inline: true },
    { name: 'App Version', value: clip(input.appVersion || 'Unknown', 256), inline: true },
    { name: 'From', value: clip(input.name || 'Anonymous', 256), inline: true },
    { name: 'Page', value: clip(page, 256), inline: false },
    { name: 'Browser', value: clip(userAgent, 256), inline: false },
  ];
  if (input.contact) {
    fields.splice(3, 0, { name: 'Contact', value: clip(input.contact, 256), inline: false });
  }

  const embed: Embed = {
    title: labels[type],
    description: clip(message, discordConfig.bugMaxLength),
    color: colors[type],
    fields,
    footer: { text: `${githubConfig.appName} Website \u2022 ${language}` },
    timestamp: new Date().toISOString(),
  };

  await post(discordConfig.bugWebhook, { username: discordConfig.bugUsername, embeds: [embed] });
  storageSet(discordConfig.storageKeys.bugCooldown, String(Date.now()));
}
