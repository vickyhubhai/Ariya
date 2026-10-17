"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowRight, IconClose, IconExternal, IconSparkles } from "@/components/icons";
import { PhoneMockup, type ScreenVariant } from "@/components/phone-mockup";
import { Reveal } from "@/components/reveal";
import { galleryItems, type GalleryItem } from "@/lib/site";

type Filter = "all" | "interface" | "artwork";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "interface", label: "Screenshots" },
  { id: "artwork", label: "Release artwork" },
];

export function ScreenshotGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const items = galleryItems.filter((item) => filter === "all" || item.kind === filter);
  const activeIndex = openId ? galleryItems.findIndex((item) => item.id === openId) : -1;
  const active = activeIndex >= 0 ? galleryItems[activeIndex] : null;

  const close = useCallback(() => {
    setOpenId((current) => {
      if (current) {
        const index = galleryItems.findIndex((item) => item.id === current);
        window.setTimeout(() => triggers.current[index]?.focus(), 0);
      }
      return null;
    });
  }, []);

  const step = useCallback((direction: 1 | -1) => {
    setOpenId((current) => {
      if (!current) return current;
      const index = galleryItems.findIndex((item) => item.id === current);
      const next = (index + direction + galleryItems.length) % galleryItems.length;
      return galleryItems[next].id;
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active, close, step]);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter gallery"
        className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/4 p-1.5"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`btn btn-sm ${filter === item.id ? "btn-primary" : "btn-ghost"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.id}>
            <Reveal delay={(index % 3) * 60}>
              <article className="glass glass-highlight card-radius group flex h-full flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-1">
                <div className="relative flex items-center justify-center border-b border-white/8 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.22),transparent_70%)] px-4 pb-4 pt-6">
                  {item.image ? (
                    <button
                      type="button"
                      ref={(node) => {
                        triggers.current[galleryItems.findIndex((g) => g.id === item.id)] = node;
                      }}
                      onClick={() => setOpenId(item.id)}
                      className={`relative block overflow-hidden border border-white/10 transition duration-500 group-hover:scale-[1.02] ${
                        item.kind === "interface"
                          ? "h-[250px] aspect-[9/20] rounded-[1.8rem]"
                          : "aspect-[16/10] w-full rounded-2xl"
                      }`}
                      aria-label={`Enlarge the ${item.title} ${item.kind === "interface" ? "screenshot" : "artwork"}`}
                    >
                      <Image
                        src={item.image}
                        alt={
                          item.kind === "interface"
                            ? `${item.title} — in-app screenshot of Ariya`
                            : `${item.title} — official Ariya release artwork`
                        }
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      ref={(node) => {
                        triggers.current[galleryItems.findIndex((g) => g.id === item.id)] = node;
                      }}
                      onClick={() => setOpenId(item.id)}
                      className="w-[min(170px,58vw)] rounded-[2rem] transition duration-500 group-hover:-translate-y-1.5"
                      aria-label={`Enlarge the ${item.title} preview`}
                    >
                      <PhoneMockup variant={(item.screen ?? "home") as ScreenVariant} showReflection={false} glow={false} />
                    </button>
                  )}
                  <span className="absolute left-3 top-3 chip border-white/15 bg-black/45 text-[0.62rem] text-white/70 backdrop-blur">
                    {item.image && item.kind === "interface" ? "In-app screenshot" : item.kind === "interface" ? "UI preview" : "Official artwork"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-[0.98rem] font-semibold leading-snug text-white/95">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50">{item.description}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setOpenId(item.id)}
                      className="tap inline-flex items-center gap-1.5 text-xs font-medium text-violet-200 transition hover:text-white"
                    >
                      Enlarge <IconArrowRight size={13} />
                    </button>
                    {item.sourceHref ? (
                      <a
                        href={item.sourceHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap tap-sm inline-flex items-center gap-1 text-[0.68rem] text-white/35 transition hover:text-white/70"
                      >
                        {item.sourceLabel} <IconExternal size={11} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>

      <p className="mt-5 flex items-start justify-center gap-2 text-center text-[0.7rem] leading-relaxed text-white/35">
        <IconSparkles size={13} className="mt-0.5 shrink-0" />
        Cards marked “In-app screenshot” are genuine captures from the Ariya Android app;
        “UI preview” cards are illustrative renderings. Artwork is the genuine imagery
        published with official release announcements.
      </p>

      {active ? (
        <div
          className="fixed inset-0 z-[80] overflow-y-auto bg-black/85 p-3 backdrop-blur-lg sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} — enlarged view`}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center">
            <div className="relative w-full rounded-3xl border border-white/10 bg-[#0a0913]/95 p-4 shadow-2xl sm:p-7">
              <button
                type="button"
                ref={closeRef}
                onClick={close}
                className="btn btn-glass btn-icon absolute right-3 top-3 z-10"
                aria-label="Close enlarged view"
              >
                <IconClose size={17} />
              </button>

              <div className="flex flex-col items-center gap-6 pt-10 sm:flex-row sm:items-center sm:pt-0">
                <div className="w-[min(220px,64vw)] shrink-0 sm:w-[240px]">
                  {active.image ? (
                    <div
                      className={`relative w-full overflow-hidden border border-white/10 ${
                        active.kind === "interface" ? "aspect-[9/20] rounded-[1.8rem]" : "aspect-square rounded-2xl"
                      }`}
                    >
                      <Image
                        src={active.image}
                        alt={
                          active.kind === "interface"
                            ? `${active.title} — in-app screenshot of Ariya`
                            : `${active.title} — official Ariya release artwork`
                        }
                        fill
                        sizes="(max-width: 640px) 64vw, 420px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <PhoneMockup variant={(active.screen ?? "home") as ScreenVariant} />
                  )}
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <span className="chip">
                    {active.image && active.kind === "interface"
                      ? "In-app screenshot"
                      : active.kind === "interface"
                        ? "Illustrative UI preview"
                        : "Official release artwork"}
                  </span>
                  <h3 className="h2 mt-3 text-[clamp(1.35rem,4vw,1.9rem)]">{active.title}</h3>
                  <p className="lede mt-2 text-sm">{active.description}</p>
                  <div className="actions actions-stack mt-5 justify-center sm:justify-start">
                    <button type="button" onClick={() => step(-1)} className="btn btn-glass btn-sm">
                      ← Previous
                    </button>
                    <button type="button" onClick={() => step(1)} className="btn btn-glass btn-sm">
                      Next →
                    </button>
                    {active.sourceHref ? (
                      <a
                        href={active.sourceHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        Source <IconExternal size={12} />
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-4 text-[0.68rem] leading-relaxed text-white/35">
                    Use the arrow keys to browse, Escape to close. Screenshots are captured from
                    the Ariya Android app; UI previews are illustrative renderings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
