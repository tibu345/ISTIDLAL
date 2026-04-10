"use client";

import { getPersonalizationEventName, isVideoSaved, recordRecentlyViewed, toggleSavedVideo } from "@/lib/personalization";
import { useEffect, useState } from "react";

type VideoPersonalizationPanelProps = {
  slug: string;
};

export function VideoPersonalizationPanel({ slug }: VideoPersonalizationPanelProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    recordRecentlyViewed(slug);
    setIsSaved(isVideoSaved(slug));

    const syncState = () => {
      setIsSaved(isVideoSaved(slug));
    };

    window.addEventListener("storage", syncState);
    window.addEventListener(getPersonalizationEventName(), syncState);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(getPersonalizationEventName(), syncState);
    };
  }, [slug]);

  return (
    <div className="panel-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow-label">Personal</p>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${isSaved ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"}`}>
          {isSaved ? "Saved" : "Local only"}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => setIsSaved(toggleSavedVideo(slug))}
          className={`${isSaved ? "primary-button" : "secondary-button"} w-full justify-center gap-2`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M5.5 3.5h9a1 1 0 0 1 1 1v12l-5.5-3-5.5 3v-12a1 1 0 0 1 1-1Z" />
          </svg>
          <span>{isSaved ? "Saved to your library" : "Save to your library"}</span>
        </button>
        <p className="text-sm leading-6 text-on-surface-variant">
          Recently viewed videos and saved picks stay on this device only.
        </p>
      </div>
    </div>
  );
}
