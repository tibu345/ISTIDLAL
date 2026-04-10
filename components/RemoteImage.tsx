"use client";

import { withBasePath } from "@/lib/asset-path";
import { getPreferredThumbnailUrl } from "@/lib/thumbnail-utils";
import { useEffect, useRef, useState } from "react";

type RemoteImageProps = {
  src: string;
  alt: string;
  className?: string;
  youtubeVideoId?: string;
};

const fallbackSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#eef2ff" />
        <stop offset="1" stop-color="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#bg)" />
    <g opacity="0.95">
      <rect x="470" y="250" width="260" height="176" rx="22" fill="#ffffff" stroke="#cbd5e1" stroke-width="8" />
      <circle cx="560" cy="320" r="32" fill="#93c5fd" />
      <path d="M520 390l76-78 50 52 38-38 56 64H520z" fill="#c4b5fd" />
    </g>
    <text x="600" y="485" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#475569">
      Preview unavailable
    </text>
  </svg>
`);

const fallbackSrc = `data:image/svg+xml;charset=UTF-8,${fallbackSvg}`;

function toCachedImageSrc(src: string, youtubeVideoId?: string) {
  const preferredSrc = getPreferredThumbnailUrl(src, youtubeVideoId);

  if (preferredSrc.startsWith("data:image/")) {
    return preferredSrc;
  }

  if (/^https?:\/\/i\.ytimg\.com\//i.test(preferredSrc)) {
    return preferredSrc;
  }

  if (/^https?:\/\//i.test(preferredSrc)) {
    return preferredSrc;
  }

  if (preferredSrc.startsWith("/")) {
    return withBasePath(preferredSrc);
  }

  return preferredSrc;
}

export function RemoteImage({ src, alt, className, youtubeVideoId }: RemoteImageProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [currentSrc, setCurrentSrc] = useState(toCachedImageSrc(src, youtubeVideoId));
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallbackState, setShowFallbackState] = useState(false);

  useEffect(() => {
    setCurrentSrc(toCachedImageSrc(src, youtubeVideoId));
    setIsLoaded(false);
    setShowFallbackState(false);
  }, [src, youtubeVideoId]);

  useEffect(() => {
    const image = imageRef.current;

    if (!image || !image.complete) {
      return;
    }

    if (image.naturalWidth > 0) {
      setIsLoaded(true);
      return;
    }

    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setShowFallbackState(true);
      return;
    }

    setShowFallbackState(true);
    setIsLoaded(true);
  }, [currentSrc]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
          <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            {showFallbackState ? "Preview unavailable" : "Loading preview"}
          </div>
        </div>
      ) : null}
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        className={`${className ?? ""} transition-all duration-500 ${isLoaded ? "opacity-100" : "opacity-0 scale-[1.01]"}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setShowFallbackState(true);
            return;
          }

          setShowFallbackState(true);
          setIsLoaded(true);
        }}
      />
    </div>
  );
}
