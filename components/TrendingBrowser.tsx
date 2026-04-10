"use client";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TrendingListItem } from "@/components/TrendingListItem";
import { type ExploreNowSection, trendingBrowsePage } from "@/lib/site-data";

type TrendingBrowserProps = {
  sections: ExploreNowSection[];
};

export function TrendingBrowser({ sections }: TrendingBrowserProps) {
  if (sections.length === 0) {
    return (
      <EmptyState
        variant="search"
        title="Nothing strong is surfacing right now"
        description="This page only shows timely videos with strong quality and topic fit. Browse categories or search a topic for a wider view."
        ctaLabel="Browse Categories"
        ctaHref="/categories"
      />
    );
  }

  return (
    <>
      <PageHeader
        badge="Explore now"
        title={trendingBrowsePage.heading}
        description="A compact editorial view of timely, high-quality videos with strong topic fit."
      />

      <div className="space-y-8">
        {sections.map((section, index) => (
          <section key={section.id} className="panel-card p-5 sm:p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-outline-variant/10 pb-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow-label">{index === 0 ? "Start here" : "Open next"}</p>
                <h2 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                  {section.description}
                </p>
              </div>
              <div className="w-full rounded-full bg-surface-container-high px-4 py-2 text-center text-sm font-medium text-on-surface md:w-auto">
                {section.items.length} quality pick{section.items.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {section.items.map((item) => (
                <TrendingListItem key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
