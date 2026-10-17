"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo, Wordmark } from "@/components/brand-logo";
import { IconClose, IconDownload, IconGithub, IconMenu } from "@/components/icons";
import { useRelease } from "@/components/release-context";
import { links, navLinks } from "@/lib/site";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
    }
    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-transparent" aria-hidden="true">
      <div
        className="h-full origin-left bg-[linear-gradient(90deg,#8b5cf6,#3ea8ff,#f472b6)] transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

function useActiveSection(pathname: string) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (pathname !== "/") return;
    const ids = navLinks
      .filter((item) => item.href.startsWith("/#"))
      .map((item) => item.href.slice(2));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`/#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return active;
}

function VersionBadge() {
  const { release, isRefreshing } = useRelease();
  if (!release) {
    return (
      <span className="hidden xl:inline-flex" aria-hidden="true">
        <span className="skeleton h-8 w-20 rounded-full" />
      </span>
    );
  }
  return (
    <span className="hidden max-w-[9rem] xl:inline-flex">
      <a
        href={release.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="chip transition hover:border-white/25 hover:text-white"
        aria-label={`Latest stable release v${release.version}${isRefreshing ? ", refreshing" : ""}`}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
        v{release.version}
      </a>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sectionActive = useActiveSection(pathname);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const active = pathname === "/" ? sectionActive : pathname;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <ScrollProgress />
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-300 ${
          scrolled || open
            ? "border-b border-white/8 bg-[rgba(6,6,12,0.82)] backdrop-blur-xl backdrop-saturate-150 shadow-[0_18px_44px_-30px_rgba(0,0,0,0.95)] supports-[backdrop-filter]:bg-[rgba(6,6,12,0.62)]"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-page flex h-[var(--nav-height)] items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl py-1 pr-1 sm:gap-3"
            aria-label="Ariya Music Player — home"
          >
            <BrandLogo size={36} priority />
            <Wordmark className="min-w-0" />
          </Link>

          <nav aria-label="Primary" className="nav-desktop items-center gap-0.5">
            {navLinks.map((item) => {
              const isActive = active === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded-full px-3 py-2 text-[0.83rem] font-medium transition-colors ${
                    isActive ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 -bottom-0.5 h-px bg-[linear-gradient(90deg,transparent,#b49bff,transparent)] transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <VersionBadge />
            <span className="hidden md:inline-flex">
              <a
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-icon"
                aria-label="Ariya on GitHub (opens in a new tab)"
              >
                <IconGithub size={18} />
              </a>
            </span>
            <Link href="/download" className="btn btn-primary btn-sm header-compact-hide">
              <IconDownload size={15} />
              Download
            </Link>
            <button
              type="button"
              className="btn btn-glass btn-icon nav-toggle"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <IconClose size={19} /> : <IconMenu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-nav"
        className={`fixed inset-0 z-[59] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal={open}
          aria-label="Site navigation"
          className={`absolute inset-x-2 top-[calc(var(--nav-height)+0.5rem)] max-h-[calc(100dvh-var(--nav-height)-1rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b15]/98 p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:inset-x-4 sm:p-4 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/35">
              Navigate
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-ghost btn-icon"
              aria-label="Close navigation menu"
            >
              <IconClose size={18} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active === item.href ? "page" : undefined}
                className={`rounded-xl px-3 py-3 text-[0.95rem] font-medium transition ${
                  active === item.href
                    ? "bg-white/8 text-white"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={links.repo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-[0.95rem] font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
            >
              <IconGithub size={16} /> GitHub repository
            </a>
          </nav>
          <div className="mt-2 grid gap-2 border-t border-white/8 pt-3">
            <Link
              href="/download"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              <IconDownload size={16} /> Download Ariya
            </Link>
            <Link
              href="/releases"
              onClick={() => setOpen(false)}
              className="btn btn-glass w-full"
            >
              Release history
            </Link>
          </div>
          <p className="px-2 pt-3 text-[0.68rem] leading-relaxed text-white/35">
            Free &amp; open source · Android 8.0+ · MIT License
          </p>
        </div>
      </div>
    </>
  );
}
