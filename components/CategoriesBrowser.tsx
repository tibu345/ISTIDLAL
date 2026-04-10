"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TopicChips } from "@/components/TopicChips";
import { VideoCard } from "@/components/VideoCard";
import { buildCategoriesBrowserState, browseCategories } from "@/lib/category-browser-shaping";
import {
  type VideoItem,
  browseCategoryDescriptions,
  categoryBrowsePage,
} from "@/lib/site-data";

type CategoryFilter = (typeof categoryBrowsePage.filters)[number];

type CategoriesBrowserProps = {
  videos: VideoItem[];
};

export function CategoriesBrowser({ videos }: CategoriesBrowserProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchCategory = searchParams.get("category");
  const searchTopic = searchParams.get("topic");

  const selectedCategory: CategoryFilter =
    searchCategory && categoryBrowsePage.filters.includes(searchCategory as CategoryFilter)
      ? (searchCategory as CategoryFilter)
      : "All";

  function updateCategoryFilter(filter: CategoryFilter) {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === "All") {
      params.delete("category");
      params.delete("topic");
    } else {
      params.set("category", filter);
      params.delete("topic");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function updateTopicFilter(topic: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory === "All" || topic === "All") {
      params.delete("topic");
    } else {
      params.set("topic", topic);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const {
    categoryOverview,
    categoryOverviewByCategory,
    selectedTopic,
    topicFilters,
    fallbackTopicSuggestions,
    selectedCategoryDescription,
    selectedTopicStarterVideos,
    selectedTopicContinueVideos,
    selectedTopicIsSparse,
    selectedTopicSummary,
    selectedTopicLearningPath,
    categoryLearningPaths,
    adjacentCategories,
  } = useMemo(
    () => buildCategoriesBrowserState(videos, selectedCategory, searchTopic),
    [videos, selectedCategory, searchTopic],
  );

  return (
    <>
      <PageHeader
        badge="Categories"
        title="Browse by category and topic"
        description="Move through one clear path: choose a category, choose a topic, then start with the best first video."
      />

      <section className="mb-8 sm:mb-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow-label">Step 1</p>
            <h2 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background sm:text-3xl">
              Pick a category
            </h2>
          </div>
          {selectedCategory !== "All" ? (
            <button
              type="button"
              onClick={() => updateCategoryFilter("All")}
              className="secondary-button w-full px-4 py-2.5 sm:w-auto"
            >
              Show all
            </button>
          ) : null}
        </div>
        <p className="mb-6 max-w-3xl text-sm leading-6 text-on-surface-variant sm:text-base">
          Categories are the entry point. Once you choose one, the next step is always a topic.
        </p>
      </section>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {browseCategories.map((category) => {
          const { categoryVideos, topicCoverage, surfacedVideoCount } = categoryOverviewByCategory[category];
          const count = surfacedVideoCount || categoryVideos.length;
          const active = selectedCategory === category;
          const previewTopics = topicCoverage.slice(0, 3);

          return (
            <button
              key={category}
              type="button"
              onClick={() => updateCategoryFilter(category)}
              className={`panel-card text-left transition-all duration-200 hover:-translate-y-0.5 ${
                active ? "bg-white shadow-xl shadow-primary/10 ring-2 ring-primary/20" : "hover:shadow-xl"
              } flex h-full flex-col p-5 sm:p-6`}
              aria-pressed={active}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{category}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    active ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {count} videos
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                {browseCategoryDescriptions[category]}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewTopics.map((topic) => (
                  <span key={topic.label} className="meta-chip">
                    {topic.label}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm font-semibold text-on-background">
                {active ? "Currently selected" : "Open category"}
              </p>
            </button>
          );
        })}
      </div>

      {selectedCategory === "All" ? (
        <div className="space-y-10">
          {categoryOverview.map(({ category, categoryVideos, topicCoverage }) => (
            <section key={category} className="panel-card p-5 sm:p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-5 border-b border-outline-variant/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="eyebrow-label">Category</p>
                  <h2 className="headline-font mt-2 text-3xl font-bold tracking-tight text-on-background">
                    {category}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                    {browseCategoryDescriptions[category]}
                  </p>
                </div>
                <Link href={`/categories?category=${encodeURIComponent(category)}`} className="secondary-button w-full sm:w-auto">
                  Explore {category}
                </Link>
              </div>

              <div className="mb-6 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                {topicCoverage.slice(0, 5).map((topic) => (
                  <Link
                    key={topic.label}
                    href={`/categories?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic.label)}`}
                    className="filter-chip shrink-0"
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>

              {categoryVideos.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {categoryVideos.slice(0, 3).map((video) => (
                    <VideoCard key={video.id} item={video} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  variant="sparse"
                  title={`No ${category} videos yet`}
                  description="This category does not have any strong content right now. Try another discipline or use Explore Now instead."
                  ctaLabel="Open Explore Now"
                  ctaHref="/trending"
                />
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <section className="panel-card p-5 sm:p-6 md:p-8">
            <div className="max-w-3xl">
              <p className="eyebrow-label">Category</p>
              <h2 className="headline-font mt-2 text-3xl font-bold tracking-tight text-on-background sm:text-4xl">
                {selectedCategory}
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                {selectedCategoryDescription}
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)] sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow-label">Step 2</p>
                  <h3 className="headline-font mt-2 text-xl font-bold tracking-tight text-on-background sm:text-2xl">
                    Choose a topic
                  </h3>
                </div>
                <p className="text-sm text-on-surface-variant">
                  {selectedTopic === "All" ? "Topics are the main way through this category." : `Focused on ${selectedTopic}.`}
                </p>
              </div>
              <TopicChips topics={topicFilters} value={selectedTopic} onChange={updateTopicFilter} />
            </div>
          </section>

          {selectedTopic === "All" ? (
            <section className="space-y-8">
              {categoryLearningPaths.length > 0 ? (
                <section className="panel-card p-5 sm:p-6 md:p-8">
                  <div className="mb-6">
                    <p className="eyebrow-label">Learning paths</p>
                    <h3 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                      Example paths in {selectedCategory}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                      Structured topic progressions built from the strongest matching videos in this category.
                    </p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {categoryLearningPaths.map((path) => (
                      <div key={path.id} className="rounded-[1.5rem] bg-surface-container-low p-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="eyebrow-label">{path.topic}</span>
                          {path.level ? <span className="meta-chip">{path.level}</span> : null}
                          <span className="meta-chip">{path.steps.length} steps</span>
                        </div>
                        <h4 className="headline-font mt-3 text-xl font-bold tracking-tight text-on-background">
                          {path.title}
                        </h4>
                        <ol className="mt-4 space-y-2 text-sm text-on-surface-variant">
                          {path.steps.slice(0, 4).map((step) => (
                            <li key={step.video.id} className="flex gap-3">
                              <span className="font-semibold text-on-background">{step.index + 1}.</span>
                              <span>
                                {step.label ? `${step.label}: ` : ""}
                                {step.video.title}
                              </span>
                            </li>
                          ))}
                        </ol>
                        <div className="mt-5">
                          <Link href={`/videos/${path.steps[0]?.video.slug}`} className="primary-button w-full sm:w-auto">
                            Start learning path
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="panel-card p-5 sm:p-6 md:p-8">
                <div className="mb-6">
                  <p className="eyebrow-label">Topics</p>
                  <h3 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                    Topic lanes in {selectedCategory}
                </h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                  Choose one topic and the page will guide you into the best place to start.
                </p>
              </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {topicFilters
                    .filter(
                      (topic): topic is {
                        label: string;
                        count: number;
                        coverageState: "active" | "light" | "empty";
                        statusLabel: string;
                      } => topic.label !== "All",
                    )
                    .map((topic) => {
                      const coverageState = "coverageState" in topic ? topic.coverageState : "empty";
                      const statusLabel = "statusLabel" in topic ? topic.statusLabel : "";
                      const count = "count" in topic ? topic.count : 0;

                      return (
                        <button
                          key={topic.label}
                          type="button"
                          onClick={() => updateTopicFilter(topic.label)}
                          className="panel-card flex h-full flex-col p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <h4 className="headline-font text-xl font-bold tracking-tight text-on-background">
                              {topic.label}
                            </h4>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                                coverageState === "active"
                                  ? "bg-primary text-white"
                                  : coverageState === "light"
                                    ? "bg-surface-container-high text-on-surface"
                                    : "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              {coverageState === "active" ? "Strong" : coverageState === "light" ? "Light" : "Quiet"}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                            {statusLabel}
                          </p>
                          <p className="mt-4 text-sm font-semibold text-on-background">
                            {count} video{count === 1 ? "" : "s"}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </section>
            </section>
          ) : !selectedTopicIsSparse && selectedTopicSummary ? (
            <section className="panel-card p-5 sm:p-6 md:p-8">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl">
                  <p className="eyebrow-label">Step 3</p>
                  <h3 className="headline-font mt-2 text-3xl font-bold tracking-tight text-on-background">
                    {selectedTopicSummary.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                    {selectedTopicSummary.description}
                  </p>
                </div>
                <span className="meta-chip">{selectedTopicSummary.statusLabel}</span>
              </div>

              <div className="space-y-10">
                {selectedTopicLearningPath ? (
                  <div className="rounded-[1.75rem] bg-surface-container-low p-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)] sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="eyebrow-label">Learning path</p>
                        <h4 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                          {selectedTopicLearningPath.title}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                          Ordered from intro to deeper coverage using high-confidence videos in this topic lane.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTopicLearningPath.level ? <span className="meta-chip">{selectedTopicLearningPath.level}</span> : null}
                        <span className="meta-chip">{selectedTopicLearningPath.steps.length} steps</span>
                      </div>
                    </div>
                    <ol className="mt-6 grid gap-4 lg:grid-cols-2">
                      {selectedTopicLearningPath.steps.map((step) => (
                        <li key={step.video.id} className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200/60">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                Step {step.index + 1}{step.label ? ` • ${step.label}` : ""}
                              </p>
                              <p className="mt-2 font-semibold text-on-background">{step.video.title}</p>
                            </div>
                            <Link href={`/videos/${step.video.slug}`} className="secondary-button w-full px-3 py-2 sm:w-auto">
                              Open
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-6">
                      <Link href={`/videos/${selectedTopicLearningPath.steps[0]?.video.slug}`} className="primary-button w-full sm:w-auto">
                        Start learning path
                      </Link>
                    </div>
                  </div>
                ) : null}

                <div>
                  <div className="mb-5">
                    <p className="eyebrow-label">Start here</p>
                    <h4 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                      Best place to begin
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {selectedTopicStarterVideos.map((video) => (
                      <VideoCard key={video.id} item={video} reason="Start here" />
                    ))}
                  </div>
                </div>

                {selectedTopicContinueVideos.length > 0 ? (
                  <div>
                    <div className="mb-5">
                      <p className="eyebrow-label">Continue learning</p>
                      <h4 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                        Stay in the same topic lane
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {selectedTopicContinueVideos.map((video) => (
                        <VideoCard key={video.id} item={video} reason={`Continue with ${selectedTopic}`} />
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <div className="mb-4">
                    <p className="eyebrow-label">Explore more</p>
                    <h4 className="headline-font mt-2 text-xl font-bold tracking-tight text-on-background">
                      Broader ways to continue
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link href={`/categories?category=${encodeURIComponent(selectedCategory)}`} className="secondary-button w-full sm:w-auto">
                      Back to {selectedCategory}
                    </Link>
                    <Link
                      href={`/search?q=${encodeURIComponent(selectedTopic)}&category=${encodeURIComponent(selectedCategory)}`}
                      className="secondary-button w-full sm:w-auto"
                    >
                      Search this topic
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-8">
              <EmptyState
                variant="sparse"
                title={`Limited coverage for ${selectedTopic}`}
                description={`${selectedTopic} does not have enough strong videos to support a full guided flow right now. Try a nearby topic or return to ${selectedCategory}.`}
                ctaLabel={`Back to ${selectedCategory}`}
                ctaHref={`/categories?category=${encodeURIComponent(selectedCategory)}`}
                secondaryCtaLabel={fallbackTopicSuggestions[0] ? `Try ${fallbackTopicSuggestions[0].label}` : undefined}
                secondaryCtaHref={
                  fallbackTopicSuggestions[0]
                    ? `/categories?category=${encodeURIComponent(selectedCategory)}&topic=${encodeURIComponent(fallbackTopicSuggestions[0].label)}`
                    : undefined
                }
                tips={fallbackTopicSuggestions.slice(0, 3).map((topic) => `Nearby topic: ${topic.label}`)}
              />

              {adjacentCategories.length > 0 ? (
                <section className="panel-card p-5 sm:p-6">
                  <p className="eyebrow-label">Explore more</p>
                  <h3 className="headline-font mt-2 text-xl font-bold tracking-tight text-on-background">
                    Broader categories worth trying
                  </h3>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {adjacentCategories.map((category) => (
                      <Link key={category} href={`/categories?category=${encodeURIComponent(category)}`} className="secondary-button w-full sm:w-auto">
                        Explore {category}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </section>
          )}
        </div>
      )}
    </>
  );
}
