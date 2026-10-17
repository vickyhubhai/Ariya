# Ariya Music Player — official website

Production-ready marketing site for **Ariya Music Player** (tagline: *Music Beyond Limits*),
built with Next.js App Router, TypeScript, Tailwind CSS v4 and Drizzle/PostgreSQL.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Styling | Tailwind CSS v4 + design tokens in `src/app/globals.css` |
| 3D / motion | CSS 3D transforms, IntersectionObserver reveals, a dependency-free canvas particle field |
| Data | Public GitHub REST API + `raw.githubusercontent.com`, cached in PostgreSQL via Drizzle |
| Icons | Hand-written SVG set (`src/components/icons.tsx`) — no icon package |
| Images | Genuine Ariya brand assets (`public/assets`) and real news artwork (`public/news`) |

No Three.js/R3F dependency is used: the device mockup, tilt cards and depth layers are pure CSS
transforms, which keeps the main-thread cost low and degrades cleanly. Every 3D/parallax effect is
disabled for `prefers-reduced-motion` and on low-power devices.

## Routes

- `/` — hero, verified feature grid, interactive showcase, latest release, developer news, download, FAQ
- `/download` — live build picker, requirements, install steps (HowTo structured data)
- `/releases` — release explorer with search and expandable changelogs
- `/releases/[tag]` — per-release page with notes, APK list, checksums
- `/news` `/news/[slug]` — Ariya_news feed and sanitised Markdown posts
- `/about` `/faq` — entity facts, privacy/security notes, full FAQ
- `/api/release/latest`, `/api/releases`, `/api/news`, `/api/news/artwork`, `/api/health`
- `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/feed.xml`, `/llms.txt`

## Data integrations (no fabricated data)

- **Releases:** `GET https://api.github.com/repos/vickyhubhai/Ariya/releases` (latest fallback via
  `/releases/latest`). Drafts, prereleases and assets whose names look like
  alpha/beta/debug/test/canary/leak builds are excluded. APK URLs must be HTTPS
  `github.com/vickyhubhai/Ariya/releases/download/…`, validated server-side **and** again in the
  browser. Versions, dates, sizes, download counts and checksums are never hardcoded.
- **News:** `metadata.json` + `content/<id>.md` from the `main` branch of
  `github.com/vickyhubhai/Ariya_news` (repository structure verified via the Contents API).
  Post ids are validated against a strict pattern before any fetch.
- **Caching:** public metadata is cached in the `ariya_api_cache` table (Drizzle) for 5–10 minutes to
  stay inside GitHub's unauthenticated rate limit. If GitHub is unreachable, the last good snapshot
  is served and clearly labelled as cached; if nothing is cached, the UI shows retry/fallback states
  and always offers the official GitHub link.

## Environment

```bash
DATABASE_URL=postgresql://…     # optional, enables the PostgreSQL cache tier (without it the app runs memory-only)
NEXT_PUBLIC_SITE_URL=https://ariyamusic.us.ci   # optional, canonical origin override
GITHUB_TOKEN=…                  # optional, server-only, raises GitHub API rate limits
```

`GITHUB_TOKEN` is read exclusively in `src/lib/github.ts` on the server and is never exposed to the
browser. Apply the schema with:

```bash
npx drizzle-kit push --config drizzle.config.json
```

## Security

- Strict CSP, HSTS, `X-Content-Type-Options`, COOP/CORP, `Referrer-Policy`, and a restrictive
  `Permissions-Policy` (`next.config.ts`). Framing is restricted with a CSP `frame-ancestors`
  allowlist (self + Arena preview hosts) instead of `X-Frame-Options`, because XFO cannot express an
  allowlist and its `DENY` value blocks the platform's own preview frame.
- No `dangerouslySetInnerHTML` for upstream content — Markdown is parsed into React nodes.
  The only inline script is the JSON-LD payload, which is escaped.
- Links in release notes/news are restricted to HTTPS hosts on an allowlist.
- The news image proxy (`/api/news/artwork`) validates host, HTTPS, content type and payload size,
  and requests a deterministic resized WebP variant from imgix so intermediary caches cannot serve a
  full-size source image.
- No analytics, ad scripts, accounts, cookies or personal data collection.
- APK downloads open the official GitHub asset URL; the server never proxies binaries.

Deployment still needs to terminate TLS and force HTTPS redirects at the edge, and should keep the
optional GitHub token in a server-side secret store.

## Performance notes

- Server components render all crawlable copy; heavy interactive pieces are small client islands.
- Images use fixed dimensions / aspect ratios to avoid layout shift; below-the-fold media is lazy.
- The particle canvas caps at ~54 particles, pauses offscreen/hidden, and is skipped on small or
  low-power devices. Intro loader is CSS-only, pointer-events-none, under 1 second, once per session.
- Release/news metadata is cached to avoid duplicate upstream requests.

## UI/UX QA layer

- `.container-page` uses fluid gutters (`clamp(1rem, 4vw, 2rem)`), caps at `82rem` and widens to
  `88rem` on ultrawide screens.
- Single navigation switch point at `lg` (1024px). Between 768–1023px the menu is a drawer, so the
  header never overflows; header utilities hide at set breakpoints via wrapper spans (Tailwind's
  `hidden` is not overridden by the unlayered `.chip`/`.btn` base classes).
- All `.btn` variants share a 44px minimum touch target, consistent hover/active/focus/disabled
  states, wrapping text and an `.btn-icon` square variant. Inline card links use `.tap`/`.tap-sm`.
- `code`, `.font-mono` and `.break-anywhere` break long URLs/identifiers so a single asset name can
  never widen a grid column (this previously clipped `/download` at 320–375px).
- Components: `FeatureExplorer` (category filtering), `ScreenshotGallery` (filters + keyboard
  lightbox), `NewsExplorer` (search/filter/sort), `ScrollToTop`, `OfflineBanner`, `SafeImage`
  (graceful image fallback) and a CSS-only `template.tsx` page transition.

Verified with headless Chromium (Playwright) at 320/375/390/430/768/1024/1280/1440/1920px across
`/`, `/download`, `/releases`, `/news`, `/about`, `/faq`: 0 horizontal overflow, 0 console errors,
0 broken images, one `<h1>` per page, plus 20 passing interaction/a11y checks.

## Known limitations (honest reporting)

- The official repository does not publish captured app screenshots, so the showcase contains clearly
  labelled **illustrative UI previews** built from documented release notes, not screenshots.
- `notFound()` responses for unknown release/news slugs currently render the branded 404 page with a
  `200` status because Next 16 streams dynamic routes; those responses are explicitly `noindex`.
- The preview hostname handed out by the platform is bound by the platform, not by this app. If a
  previously issued `*.arena.site` preview URL serves an older build, open the preview URL returned by
  the platform runtime (`https://3000-*.e2b.app`) or refresh the preview from Arena to re-bind it.
- Lighthouse was not executed inside this sandbox (no headless browser available). Route status codes,
  production build, type checks and payload sizes were verified directly; run Lighthouse against the
  deployed HTTPS URL for field/lab scores.
- GitHub availability and rate limits are external dependencies; the UI degrades gracefully.

## Scripts

```bash
npm run dev        # local development
npm run lint       # ESLint (Next core-web-vitals + React hooks rules)
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run start      # production server
```
