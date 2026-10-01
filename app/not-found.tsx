import type { Metadata } from 'next';

/** Standalone error page from `404.html`; the layout adds the nav and footer. */
export const metadata: Metadata = {
  title: 'Page not found - Ariya',
  description: 'The page you were looking for does not exist.',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function NotFound() {
  // Rendered inside the layout's <main id="main">, so this stays a plain div to
  // avoid nesting two main landmarks (`.notfound` is tag-agnostic in the CSS).
  return (
    <div className="notfound">
      <picture>
        <source type="image/webp" srcSet="/assets/ariya-logo-240.webp" />
        <img src="/assets/ariya-logo-240.png" alt="" width={240} height={240} className="notfound-logo" decoding="async" />
      </picture>
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <a href="/" className="btn-primary">
        Back to Ariya
      </a>
    </div>
  );
}
