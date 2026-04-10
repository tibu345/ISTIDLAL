"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { InterestTopicSummary } from "@/lib/personalized-discovery";
import { buildPersonalizedDiscovery } from "@/lib/personalized-discovery";
import { getPersonalizationEventName, getRecentlyViewedSlugs, getSavedVideoSlugs } from "@/lib/personalization";
import { getBrowseCategoryForVideo, type VideoItem } from "@/lib/site-data";
import { EmptyState } from "./EmptyState";
import { VideoCard } from "./VideoCard";

type PersonalLibrarySectionProps = {
  videos: VideoItem[];
  showEmptyState?: boolean;
};

type StoredVideoGroups = {
  recentlyViewed: string[];
  savedVideos: string[];
};

type ContinuationCandidate = {
  title: string;
  stepLabel: string | null;
  nextVideo: VideoItem;
  reason: string;
  ctaLabel: string;
  ctaHref: string;
  supportingLabel: string;
};

function createVideoMap(videos: VideoItem[]) {
  return new Map(videos.map((video) => [video.slug, video]));
}

function toOrderedVideos(slugs: string[], videoMap: Map<string, VideoItem>) {
  return slugs.map((slug) => videoMap.get(slug)).filter((video): video is VideoItem => Boolean(video));
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="eyebrow-label">{eyebrow}</p>
      <h2 className="headline-font text-2xl font-bold tracking-tight text-on-background">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">{description}</p>
    </div>
  );
}

function VideoGrid({
  items,
  getReason,
}: {
  items: VideoItem[];
  getReason?: (item: VideoItem) => string | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <VideoCard key={item.slug} item={item} reason={getReason?.(item)} />
      ))}
    </div>
  );
}

function buildPrimaryContinuation(
  topics: InterestTopicSummary[],
  recentVideos: VideoItem[],
  recommendationReasons: Map<string, string>,
): ContinuationCandidate | null {
  const bestTopic = topics.find((topic) => topic.nextRecommendations[0]);

  if (bestTopic) {
    const nextRecommendation = bestTopic.nextRecommendations[0];

    return {
      title: bestTopic.topic,
      stepLabel: bestTopic.stepLabel,
      nextVideo: nextRecommendation.video,
      reason: nextRecommendation.reason,
      ctaLabel: "Continue your path",
      ctaHref: `/videos/${nextRecommendation.video.slug}`,
      supportingLabel: `${bestTopic.category} topic`,
    };
  }

  const recentVideo = recentVideos[0];

  if (recentVideo) {
    return {
      title: recentVideo.title,
      stepLabel: "Resume",
      nextVideo: recentVideo,
      reason: "Return to the most recent video in your learning trail.",
      ctaLabel: "Resume video",
      ctaHref: `/videos/${recentVideo.slug}`,
      supportingLabel: getBrowseCategoryForVideo(recentVideo),
    };
  }

  const nextRecommendation = [...recommendationReasons.keys()][0];

  if (!nextRecommendation) {
    return null;
  }

  return null;
}

function PrimaryContinuationCard({ candidate }: { candidate: ContinuationCandidate }) {
  return (
    <section className="panel-card p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Continue learning</p>
          <h2 className="headline-font mt-2 break-words text-2xl font-bold tracking-tight text-on-background sm:text-4xl">
            {candidate.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant sm:text-base">
            {candidate.reason}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate.stepLabel ? <span className="meta-chip">{candidate.stepLabel}</span> : null}
          <span className="meta-chip">{candidate.supportingLabel}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-surface-container-low p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Next video</p>
        <p className="mt-2 text-lg font-semibold text-on-background">{candidate.nextVideo.title}</p>
      </div>

      <div className="mt-5">
        <Link href={candidate.ctaHref} className="secondary-button w-full sm:w-auto">
          {candidate.ctaLabel}
        </Link>
      </div>
    </section>
  );
}

export function PersonalLibrarySection({
  videos,
  showEmptyState = false,
}: PersonalLibrarySectionProps) {
  const [storedGroups, setStoredGroups] = useState<StoredVideoGroups>({
    recentlyViewed: [],
    savedVideos: [],
  });

  useEffect(() => {
    const syncGroups = () => {
      setStoredGroups({
        recentlyViewed: getRecentlyViewedSlugs(),
        savedVideos: getSavedVideoSlugs(),
      });
    };

    syncGroups();

    window.addEventListener("storage", syncGroups);
    window.addEventListener(getPersonalizationEventName(), syncGroups);

    return () => {
      window.removeEventListener("storage", syncGroups);
      window.removeEventListener(getPersonalizationEventName(), syncGroups);
    };
  }, []);

  const videoMap = useMemo(() => createVideoMap(videos), [videos]);
  const savedVideos = toOrderedVideos(storedGroups.savedVideos, videoMap).slice(0, 4);
  const recentlyViewed = toOrderedVideos(storedGroups.recentlyViewed, videoMap).slice(0, 4);
  const personalizedDiscovery = useMemo(
    () =>
      buildPersonalizedDiscovery(videos, {
        recentSlugs: storedGroups.recentlyViewed,
        savedSlugs: storedGroups.savedVideos,
      }),
    [videos, storedGroups.recentlyViewed, storedGroups.savedVideos],
  );

  const recommendationReasons = useMemo(
    () => new Map(personalizedDiscovery.recommendations.map((entry) => [entry.video.slug, entry.reason])),
    [personalizedDiscovery.recommendations],
  );
  const primaryContinuation = buildPrimaryContinuation(
    personalizedDiscovery.interestTopics,
    recentlyViewed,
    recommendationReasons,
  );

  if (recentlyViewed.length === 0 && savedVideos.length === 0 && !showEmptyState) {
    return null;
  }

  return (
    <section className="section-shell">
      <div className="panel-card mb-12 p-5 sm:p-8 lg:p-10">

        {savedVideos.length === 0 && recentlyViewed.length === 0 ? (
          <EmptyState
            variant="saved"
            title="Nothing to continue yet"
            description="Open a few strong videos or save the ones worth keeping. This page will then turn them into a clean continuation view."
            ctaLabel={showEmptyState ? "Browse categories" : undefined}
            ctaHref={showEmptyState ? "/categories" : undefined}
            secondaryCtaLabel={showEmptyState ? "Open now" : undefined}
            secondaryCtaHref={showEmptyState ? "/trending" : undefined}
            tips={["Recent videos stay on this device", "Saved picks shape follow-up recommendations", "Use categories to start a topic thread"]}
          />
        ) : (
          <div className="space-y-12">
            {primaryContinuation ? <PrimaryContinuationCard candidate={primaryContinuation} /> : null}

            {recentlyViewed.length > 0 ? (
              <section className="space-y-5">
                <SectionHeader
                  eyebrow="Recent videos"
                  title="What you touched most recently"
                  description="A simple return strip for the videos you opened last."
                />
                <VideoGrid items={recentlyViewed} />
              </section>
            ) : null}

            {personalizedDiscovery.recommendations.length > 0 ? (
              <section className="space-y-5">
                <SectionHeader
                  eyebrow="From your interests"
                  title="Recommended next videos"
                  description={
                    personalizedDiscovery.dominantTopic
                      ? `Follow-up picks shaped by your local activity around ${personalizedDiscovery.dominantTopic}.`
                      : "Follow-up picks shaped by your local recent and saved activity."
                  }
                />
                <VideoGrid
                  items={personalizedDiscovery.recommendations.map((entry) => entry.video)}
                  getReason={(item) => recommendationReasons.get(item.slug)}
                />
              </section>
            ) : null}

            <section className="space-y-5">
              <SectionHeader
                eyebrow="Saved videos"
                title="Keep useful references close"
                description="Saved videos stay available here as a lower-priority reference layer."
              />
              {savedVideos.length > 0 ? (
                <VideoGrid items={savedVideos} getReason={() => "Saved reference"} />
              ) : (
                <EmptyState
                  variant="saved"
                  compact
                  title="No saved videos yet"
                  description="Save standout videos as you browse so your best references stay easy to revisit."
                  ctaLabel="Browse categories"
                  ctaHref="/categories"
                />
              )}
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
