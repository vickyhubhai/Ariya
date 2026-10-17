"use client";

import { useMemo, useState } from "react";
import { IconAlert, IconClose, IconSearch } from "@/components/icons";
import { NewsCard } from "@/components/news-card";
import type { NewsPost } from "@/lib/news";

type Filter = "all" | "featured";

/**
 * Client-side news search, filtering and sorting.
 * The full list is server-rendered on first paint, so the content stays
 * crawlable; interactions only reorder/hide cards.
 */
export function NewsExplorer({ posts }: { posts: NewsPost[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = posts.filter((post) => {
      const matchesFilter = filter === "all" || post.important;
      const matchesQuery =
        !needle ||
        post.title.toLowerCase().includes(needle) ||
        post.description.toLowerCase().includes(needle) ||
        post.author.toLowerCase().includes(needle) ||
        post.dateLabel.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
    return sort === "newest"
      ? result
      : [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [posts, query, filter, sort]);

  return (
    <div>
      <div className="glass card-radius flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 focus-within:border-violet-300/40">
            <IconSearch size={16} className="shrink-0 text-white/40" />
            <span className="sr-only">Search developer news</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search updates by title, summary or date"
              className="w-full min-w-0 bg-transparent py-1 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="btn btn-ghost btn-icon-xs"
                aria-label="Clear news search"
              >
                <IconClose size={13} />
              </button>
            ) : null}
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Filter news" className="flex flex-wrap gap-1.5">
              {([
                { id: "all", label: "All posts" },
                { id: "featured", label: "Featured" },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                  className={`btn btn-sm ${filter === option.id ? "btn-primary" : "btn-ghost"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSort((current) => (current === "newest" ? "oldest" : "newest"))}
              className="btn btn-glass btn-sm"
              aria-label={`Sort by date, currently ${sort === "newest" ? "newest first" : "oldest first"}`}
            >
              {sort === "newest" ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>
        <p className="px-1 text-xs text-white/40" aria-live="polite">
          Showing <span className="text-white/75">{visible.length}</span> of {posts.length} developer
          updates
        </p>
      </div>

      {visible.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((post, index) => (
            <NewsCard key={post.id} post={post} priority={index < 2 && !query} />
          ))}
        </div>
      ) : (
        <div className="glass card-radius mt-5 p-8 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
            <IconAlert size={16} /> No updates match your search.
          </p>
          <p className="mt-2 text-sm text-white/45">
            Try a shorter query, or reset the filters to see every published update.
          </p>
          <button
            type="button"
            className="btn btn-glass btn-sm mt-4"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
