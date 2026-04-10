"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildPersonalizedDiscovery } from "@/lib/personalized-discovery";
import { getPersonalizationEventName, getRecentlyViewedSlugs, getSavedVideoSlugs } from "@/lib/personalization";
import { getBrowseCategoryForVideo, type VideoItem } from "@/lib/site-data";

type HomeResumeSectionProps = {
  videos: VideoItem[];
};

type StoredSignals = {
  recentSlugs: string[];
  savedSlugs: string[];
};

function createVideoMap(videos: VideoItem[]) {
  return new Map(videos.map((video) => [video.slug, video]));
}

function toOrderedVideos(slugs: string[], videoMap: Map<string, VideoItem>) {
  return slugs.map((slug) => videoMap.get(slug)).filter((video): video is VideoItem => Boolean(video));
}

export function HomeResumeSection({ videos }: HomeResumeSectionProps) {
  const [signals, setSignals] = useState<StoredSignals>({
    recentSlugs: [],
    savedSlugs: [],
  });

  useEffect(() => {
    const syncSignals = () => {
      setSignals({
        recentSlugs: getRecentlyViewedSlugs(),
        savedSlugs: getSavedVideoSlugs(),
      });
    };

    syncSignals();

    window.addEventListener("storage", syncSignals);
    window.addEventListener(getPersonalizationEventName(), syncSignals);

    return () => {
      window.removeEventListener("storage", syncSignals);
      window.removeEventListener(getPersonalizationEventName(), syncSignals);
    };
  }, []);

  const videoMap = useMemo(() => createVideoMap(videos), [videos]);
  const recentVideos = toOrderedVideos(signals.recentSlugs, videoMap);
  const personalizedDiscovery = useMemo(
    () =>
      buildPersonalizedDiscovery(videos, {
        recentSlugs: signals.recentSlugs,
        savedSlugs: signals.savedSlugs,
      }),
    [videos, signals.recentSlugs, signals.savedSlugs],
  );

  const resumeVideo =
    personalizedDiscovery.interestTopics[0]?.nextRecommendations[0]?.video ??
    recentVideos[0] ??
    personalizedDiscovery.recommendations[0]?.video ??
    null;
  const resumeReason =
    personalizedDiscovery.interestTopics[0]?.nextRecommendations[0]?.reason ??
    (recentVideos[0] ? "Pick up the last thread you opened." : personalizedDiscovery.recommendations[0]?.reason) ??
    null;
  const supportingLabel =
    personalizedDiscovery.interestTopics[0]?.stepLabel ??
    (resumeVideo ? getBrowseCategoryForVideo(resumeVideo) : null);
  const hasContinuationSignals =
    signals.recentSlugs.length > 0 || Boolean(personalizedDiscovery.interestTopics[0]?.nextRecommendations[0]);

  if (!hasContinuationSignals || !resumeVideo) {
    return null;
  }

  return (
    <div className="section-shell mb-6">
      <div className="panel-card mx-auto max-w-5xl overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative">
            <div className="absolute -left-6 top-0 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_center,rgba(20,91,85,0.18),transparent_70%)] blur-xl" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#145b55]"></span>
              </span>
              <p className="eyebrow-label text-[10px] text-[#145b55]">Continue where you left off</p>
            </div>
            <h2 className="headline-font mt-2 line-clamp-1 text-[1.05rem] font-bold leading-tight tracking-tight text-slate-800 sm:text-[1.15rem]">
              {resumeVideo.title}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500 line-clamp-1">
              {resumeReason}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:mt-0">
            <Link href={`/videos/${resumeVideo.slug}`} className="primary-button rounded-xl px-4 py-2 text-xs">
              Resume now
            </Link>
            <Link href="/library" className="secondary-button rounded-xl px-4 py-2 text-xs">
              Open library
            </Link>
            {supportingLabel ? (
              <span className="ml-2 hidden items-center rounded-full border border-white/80 bg-white/90 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 sm:inline-flex">
                {supportingLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
