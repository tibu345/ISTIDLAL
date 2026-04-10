"use client";

import { useEffect, useState } from "react";
import { buildPersonalizedDiscovery } from "@/lib/personalized-discovery";
import { getPersonalizationEventName, getRecentlyViewedSlugs, getSavedVideoSlugs } from "@/lib/personalization";
import type { VideoItem } from "@/lib/site-data";
import { EmptyState } from "./EmptyState";
import { VideoCard } from "./VideoCard";

type PersonalizedVideoSuggestionsProps = {
  videos: VideoItem[];
  currentSlug: string;
};

export function PersonalizedVideoSuggestions({ videos, currentSlug }: PersonalizedVideoSuggestionsProps) {
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  useEffect(() => {
    const syncSignals = () => {
      setRecentSlugs(getRecentlyViewedSlugs());
      setSavedSlugs(getSavedVideoSlugs());
    };

    syncSignals();

    window.addEventListener("storage", syncSignals);
    window.addEventListener(getPersonalizationEventName(), syncSignals);

    return () => {
      window.removeEventListener("storage", syncSignals);
      window.removeEventListener(getPersonalizationEventName(), syncSignals);
    };
  }, []);

  const personalizedDiscovery = buildPersonalizedDiscovery(videos, {
    recentSlugs,
    savedSlugs,
    currentSlug,
  });

  if (recentSlugs.length === 0 && savedSlugs.length === 0) {
    return null;
  }

  if (personalizedDiscovery.recommendations.length === 0) {
    return (
      <EmptyState
        variant="related"
        compact
        title="No personalized follow-up yet"
        description="Keep exploring a few more videos and this section will start shaping itself around your recent interests."
        ctaLabel="Browse categories"
        ctaHref="/categories"
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="eyebrow-label">For you</p>
        <h2 className="headline-font text-2xl font-bold tracking-tight text-on-background">
          Personalized follow-up
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
          {personalizedDiscovery.dominantTopic
            ? `Shaped by your recent activity, with the strongest next videos around ${personalizedDiscovery.dominantTopic}.`
            : "Shaped by your recent and saved activity, with the strongest next videos from the same serious lanes."}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {personalizedDiscovery.recommendations.slice(0, 3).map((entry) => (
          <div key={entry.video.id}>
            <VideoCard item={entry.video} reason={entry.reason} />
          </div>
        ))}
      </div>
    </section>
  );
}
