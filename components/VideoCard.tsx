import { getBrowseCategoryForVideo, getVideoLevelLabel, getVideoTrustLabel, type VideoCardItem } from "@/lib/site-data";
import { getTopicsForVideo, isLikelyVerticalThumbnail } from "@/lib/video-curation";
import Link from "next/link";
import { RemoteImage } from "./RemoteImage";

export function VideoCard({ item, reason }: { item: VideoCardItem; reason?: string }) {
  const isRecent = item.publishedAt.includes("1h") || item.publishedAt.includes("2h");
  const useContainedMedia = item.isShortForm || isLikelyVerticalThumbnail(item);
  const browseCategory = getBrowseCategoryForVideo(item);
  const trustLabel = getVideoTrustLabel(item);
  const levelLabel = getVideoLevelLabel(item);

  return (
    <Link
      href={`/videos/${item.slug}`}
      className="surface-link group interactive-panel panel-card flex h-full flex-col p-3.5 sm:p-5"
    >
      <div className="media-frame relative mb-4 aspect-video">
        <RemoteImage
          src={item.thumbnail}
          alt={item.alt}
          youtubeVideoId={item.youtubeVideoId}
          className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${
            useContainedMedia ? "bg-slate-100 object-contain p-2.5" : "object-cover"
          }`}
        />
        {isRecent ? (
          <span className="absolute left-2 top-2 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#145b55] shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
            New
          </span>
        ) : null}
        {trustLabel ? (
          <span className="absolute left-2 bottom-2 rounded-full bg-[#0a1c1b]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            {trustLabel}
          </span>
        ) : null}
        {item.isShortForm ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            Short
          </span>
        ) : null}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold text-white">
          {item.duration}
        </span>
      </div>
      {reason ? (
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full border border-white/80 bg-[#ebfaf5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#145b55]">
            {reason}
          </span>
        </div>
      ) : (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="meta-chip">{browseCategory}</span>
          <span className="meta-chip hidden sm:inline-flex">{levelLabel}</span>
        </div>
      )}
      <h4 className="headline-font line-clamp-2 text-[1.08rem] font-bold leading-snug text-on-background transition-colors group-hover:text-[#145b55]">
        {item.title}
      </h4>
      <p className="mt-1.5 hidden text-[13px] leading-relaxed text-on-surface-variant line-clamp-2 sm:block">
        {item.description}
      </p>
      <div className="meta-row mt-auto border-t border-slate-200/70 pt-4 text-[13px] sm:text-sm">
        <span className="min-w-0 truncate">{item.channel}</span>
        <span className="h-1 w-1 rounded-full bg-outline-variant" />
        <span>{item.publishedAt}</span>
      </div>
    </Link>
  );
}
