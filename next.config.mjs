/**
 * Next.js config for the Ariya site.
 *
 * Caching + redirect rules are ported 1:1 from the static site's `_headers`
 * and `_redirects` files so that hosting behaviour stays identical after the
 * migration (assets cached for a week, service worker never cached, and the
 * legacy `.html` URLs pointing at the new App Router routes).
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  agentRules: false,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async redirects() {
    return [
      // Legacy entry points kept working after the migration.
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/about/index.html', destination: '/about', permanent: true },
      { source: '/404.html', destination: '/404', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
