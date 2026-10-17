import type { NextConfig } from "next";

/**
 * Security headers are applied to every route.
 *
 * - `script-src` allows inline scripts because the Next.js App Router emits
 *   small inline bootstrap/hydration scripts; no third-party script origin is
 *   allowed at all. Dev mode also gets `'unsafe-eval'` because React's dev
 *   tooling requires eval() to reconstruct callstacks; production never does.
 * - `img-src`/`connect-src` are limited to this origin. News artwork is proxied
 *   through a validated server route, so the browser never talks to imgix or
 *   raw.githubusercontent.com directly.
 * - `frame-ancestors` allows only this origin, so no third-party site can frame
 *   the site (clickjacking protection).
 * - `upgrade-insecure-requests` plus HSTS keep traffic on HTTPS. Edge-level
 *   HTTPS redirects still need to be enabled by the hosting provider.
 */
const frameAncestors = "'self'";

const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${frameAncestors}`,
  "frame-src 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Intentionally not setting X-Frame-Options: framing is governed by the CSP
  // `frame-ancestors` directive above, which the modern browsers this site
  // targets all support.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600],
    minimumCacheTTL: 86400,
    // next/image rejects local srcs with query strings unless a pattern allows
    // them; news artwork is served through the /api/news/artwork proxy.
    localPatterns: [
      { pathname: "/assets/**", search: "" },
      { pathname: "/api/news/artwork" },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/news/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/releases/latest", destination: "/download", permanent: true },
      { source: "/changelog", destination: "/releases", permanent: true },
      { source: "/downloads", destination: "/download", permanent: true },
      { source: "/api/news/image", destination: "/api/news/artwork", permanent: true },
    ];
  },
};

export default nextConfig;
