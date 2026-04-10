"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { VideoCard } from "@/components/VideoCard";
import { getDemoSearchResponse } from "@/lib/demo-content";
import { type BrowseCategory, getBrowseCategoryForVideo } from "@/lib/site-data";

const browseCategories: BrowseCategory[] = ["AI & Tech", "Physics", "Mathematics", "Science"];

export function SearchExperience() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const categoryParam = searchParams.get("category");
  const selectedCategory =
    categoryParam && browseCategories.includes(categoryParam as BrowseCategory)
      ? (categoryParam as BrowseCategory)
      : null;

  const searchResponse = useMemo(
    () =>
      query
        ? getDemoSearchResponse(query, { category: selectedCategory })
        : { results: [], matches: [], intent: null },
    [query, selectedCategory],
  );
  const results = searchResponse.results;
  const searchMatchesBySlug = new Map(searchResponse.matches.map((entry) => [entry.video.slug, entry.reason]));
  const categoryBreakdown = results.reduce<Record<string, number>>((accumulator, video) => {
    const key = getBrowseCategoryForVideo(video);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <>
      <PageHeader
        badge="Search"
        title="Search the demo library"
        description={
          query
            ? `Results for "${query}" across categories, topics, and curated demo metadata.`
            : "Find a topic, a method, or a category without falling back to a noisy generic feed."
        }
      />

      {query ? (
        results.length > 0 ? (
          <div className="space-y-8">
            <section className="panel-card p-5 sm:p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="eyebrow-label">Search lane</p>
                  <h2 className="headline-font mt-2 break-words text-2xl font-bold tracking-tight text-on-background sm:text-3xl">
                    "{query}"
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                    {results.length} strong result{results.length === 1 ? "" : "s"} in the current demo library.
                    {selectedCategory ? ` Focused on ${selectedCategory}.` : ""}
                  </p>
                </div>
                <Link href="/categories" className="secondary-button w-full sm:w-auto">
                  Browse Categories
                </Link>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="stat-tile">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Best lane</p>
                  <p className="mt-2 text-sm font-semibold text-on-background">
                    {selectedCategory ?? Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Mixed"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    The strongest visible category signal in these matches.
                  </p>
                </div>
                <div className="stat-tile">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Coverage</p>
                  <p className="mt-2 text-sm font-semibold text-on-background">
                    {results.length} result{results.length === 1 ? "" : "s"} across {Object.keys(categoryBreakdown).length} categor{Object.keys(categoryBreakdown).length === 1 ? "y" : "ies"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Refine by lane below if you want a narrower path.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="eyebrow-label">Refine by category</p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
                      selectedCategory === null ? "bg-primary text-white" : "bg-surface-container-high text-on-surface"
                    }`}
                  >
                    All categories
                  </Link>
                  {Object.entries(categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <Link
                        key={category}
                        href={`/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
                          selectedCategory === category ? "bg-primary text-white" : "bg-surface-container-high text-on-surface"
                        }`}
                      >
                        <span>{category}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            selectedCategory === category ? "bg-white/20 text-white" : "bg-white text-slate-600"
                          }`}
                        >
                          {count}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow-label">Results</p>
                  <h2 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                    Matching videos
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                    Ordered by the strongest current match in the requested search lane.
                  </p>
                </div>
                <p className="text-sm text-on-surface-variant">
                  {results.length} item{results.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {results.map((video) => (
                  <VideoCard
                    key={video.id}
                    item={video}
                    reason={searchMatchesBySlug.get(video.slug) ?? (selectedCategory ? `Best fit for ${selectedCategory}` : "Search match")}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <EmptyState
            variant="search"
            title={`No results for "${query}"`}
            description="No strong demo results matched that search. Try a broader topic, a nearby category, or fewer keywords."
            ctaLabel="Browse Categories"
            ctaHref="/categories"
            secondaryCtaLabel="Open Explore Now"
            secondaryCtaHref="/trending"
            tips={["Try a broader topic", "Try Physics or AI & Tech", "Use fewer keywords"]}
          />
        )
      ) : (
        <EmptyState
          variant="search"
          title="Start a search"
          description="Search by topic, category, or subject to jump into the strongest demo videos."
          ctaLabel="Open Explore Now"
          ctaHref="/trending"
          secondaryCtaLabel="Browse categories"
          secondaryCtaHref="/categories"
          tips={["Topics", "Learning paths", "Science and technology categories"]}
        />
      )}
    </>
  );
}
