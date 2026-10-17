"use client";

import { useMemo, useState } from "react";
import { featureIcons, IconSparkles } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/tilt-card";
import { featureCategories, features } from "@/lib/site";

/**
 * Interactive feature explorer.
 *
 * Every card stays in the server-rendered HTML (filtering only toggles the
 * `hidden` attribute), so crawlers and no-JS users get the complete, factual
 * feature list while mouse/keyboard users get filtering.
 */
export function FeatureExplorer() {
  const [category, setCategory] = useState<(typeof featureCategories)[number]>("All");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const feature of features) {
      map.set(feature.meta, (map.get(feature.meta) ?? 0) + 1);
    }
    return map;
  }, []);

  // Filtering re-renders the list. The unfiltered list is what gets
  // server-rendered, so crawlers and no-JS users still receive every feature.
  const visible =
    category === "All" ? features : features.filter((feature) => feature.meta === category);

  return (
    <div>
      <div className="glass card-radius flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div
          role="group"
          aria-label="Filter features by category"
          className="flex flex-wrap gap-1.5"
        >
          {featureCategories.map((item) => {
            const count = item === "All" ? features.length : (counts.get(item) ?? 0);
            if (count === 0) return null;
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item)}
                className={`btn btn-sm ${active ? "btn-primary" : "btn-ghost"}`}
              >
                {item}
                <span className={`text-[0.66rem] ${active ? "text-black/55" : "text-white/35"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="shrink-0 text-xs text-white/40" aria-live="polite">
          Showing <span className="text-white/75">{visible.length}</span> of {features.length} verified
          capabilities
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((feature, index) => {
          const Icon = featureIcons[feature.icon];
          return (
            <Reveal key={feature.title} delay={(index % 3) * 60}>
              <TiltCard className="glass glass-highlight card-radius h-full p-5 sm:p-6">
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[linear-gradient(150deg,rgba(139,92,246,0.28),rgba(62,168,255,0.12))] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                      <Icon size={20} />
                    </span>
                    <span className="chip border-white/8 bg-white/4 text-white/45">{feature.meta}</span>
                  </div>
                  <h3 className="h3 mt-4 break-anywhere">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{feature.description}</p>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-5 flex items-start gap-2 text-[0.7rem] leading-relaxed text-white/35">
        <IconSparkles size={13} className="mt-0.5 shrink-0" />
        Source-dependent behaviour is labelled explicitly: lossless audio, lyrics and discovery
        results depend on the selected source and track.
      </p>
    </div>
  );
}
