/**
 * Browser-safe news image helpers.
 *
 * Deliberately kept free of database/Node imports so client components
 * (news cards, gallery, search) can use them without pulling server code into
 * the browser bundle.
 */

const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", "raw.githubusercontent.com"];

export function isAllowedNewsImage(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host.endsWith(".imgix.net") || ALLOWED_IMAGE_HOSTS.includes(host);
  } catch {
    return false;
  }
}

/** Same-origin URL for the validated, resizing image proxy. */
export function newsImageProxyUrl(image: string, width = 1000): string {
  return `/api/news/artwork?src=${encodeURIComponent(image)}&w=${width}`;
}
