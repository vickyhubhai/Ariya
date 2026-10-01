'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { ABOUT_NAV_LINKS, NAV_LINKS } from '@/lib/content';

/**
 * Shared header. It lives in the root layout, so it derives its own link set
 * from the pathname: hash targets are absolute (`/#features`) off the home page.
 */
export default function Navbar() {
  const pathname = usePathname();
  const onAbout = pathname.startsWith('/about');
  const links = onAbout ? ABOUT_NAV_LINKS : NAV_LINKS;
  const downloadHref = onAbout ? '/#download' : '#download';
  const navRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggleLabel, setToggleLabel] = useState('Open menu');
  const [activeHash, setActiveHash] = useState<string | null>(null);

  useEffect(() => {
    // Hash targets of the current page; empty on /about, whose links are absolute.
    const targets = links.filter((item) => !item.external && item.href.startsWith('#')).map((item) => item.href);

    let ticking = false;
    const measure = () => {
      setScrolled(window.scrollY > 30);
      // Scroll spy: the last section whose top edge has passed under the sticky nav.
      let current: string | null = null;
      for (const target of targets) {
        const el = document.querySelector(target);
        if (el && el.getBoundingClientRect().top <= 130) current = target;
      }
      setActiveHash(current);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [links]);

  useEffect(() => {
    setToggleLabel(menuOpen ? 'Close menu' : 'Open menu');
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const close = () => setMenuOpen(false);
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (navRef.current && !navRef.current.contains(target ?? null)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onResize = () => {
      if (window.innerWidth > 900) close();
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  /** Same as before: intercept `#hash` clicks and glide instead of jumping. */
  const onAnchorClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href') ?? '';
    if (!href.startsWith('#')) return;
    e.preventDefault();
    setMenuOpen(false);
    let target: HTMLElement | null = null;
    try {
      target = document.querySelector(href);
    } catch {
      target = null;
    }
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', href);
  };

  const linkClass = (href: string) => (href === pathname || href === activeHash ? 'is-current' : undefined);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className={[scrolled ? 'scrolled' : '', menuOpen ? 'menu-open' : ''].filter(Boolean).join(' ') || undefined}
    >
      <div className="container inner">
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
          <picture>
            <source type="image/webp" srcSet="/assets/ariya-logo-64.webp" />
            <img src="/assets/ariya-logo-64.png" alt="" width={64} height={64} decoding="async" />
          </picture>
          Ariya
        </Link>

        <div className="links" id="nav-links">
          {links.map((item) =>
            item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener">
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                aria-current={item.href === pathname ? 'page' : item.href === activeHash ? 'true' : undefined}
                onClick={onAnchorClick}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        <Link href={downloadHref} className="dl-btn" onClick={onAnchorClick}>
          Download
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-controls="nav-links"
          aria-expanded={menuOpen}
          aria-label={toggleLabel}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((open) => !open);
          }}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>
    </nav>
  );
}
