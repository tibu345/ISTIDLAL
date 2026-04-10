import type { TrendingItem } from "@/lib/site-data";
import { isLikelyVerticalThumbnail } from "@/lib/video-curation";
import Link from "next/link";
import { RemoteImage } from "./RemoteImage";

export function TrendingListItem({ item }: { item: TrendingItem }) {
  const useContainedMedia = item.isShortForm || isLikelyVerticalThumbnail(item);
  const leadingLabel = item.label ?? "Worth exploring";
  const fitLabel = item.reason ?? "Strong quality and relevance for the current library.";
  const topicLabel = item.topics?.[0] ?? "Broad topic fit";

  return (
    <Link
      href={`/videos/${item.slug}`}
      className="surface-link group interactive-panel panel-card flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:gap-5"
    >
      <div className="media-frame h-44 w-full shrink-0 sm:h-52 md:h-28 md:w-44">
        <RemoteImage
          src={item.thumbnail}
          alt={item.title}
          youtubeVideoId={item.youtubeVideoId}
          className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${useContainedMedia ? "bg-slate-100 object-contain p-1.5" : "object-cover"}`}
        />
      </div>

      <div className="min-w-0 flex-grow">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="meta-chip bg-[#ebfaf5] text-[#145b55]">{leadingLabel}</span>
          <span className="eyebrow-label text-[#145b55]">{item.category}</span>
          {item.topics?.slice(0, 1).map((topic) => (
            <span key={topic} className="meta-chip">
              {topic}
            </span>
          ))}
        </div>
        <h4 className="headline-font line-clamp-2 text-xl font-bold leading-snug text-on-background transition-colors group-hover:text-[#145b55] sm:text-[1.4rem]">
          {item.title}
        </h4>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant line-clamp-2">
          {item.shortDescription}
        </p>
        <div className="mt-4 grid gap-2 text-sm text-on-surface-variant sm:grid-cols-2">
          <div className="stat-tile">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Why it fits</p>
            <p className="mt-1 line-clamp-2 font-medium text-slate-700">{fitLabel}</p>
          </div>
          <div className="stat-tile">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Published</p>
            <p className="mt-1 font-medium text-slate-700">{item.publishedAt}</p>
          </div>
          <div className="stat-tile">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Category</p>
            <p className="mt-1 font-medium text-slate-700">{item.category}</p>
          </div>
          <div className="stat-tile">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Topic</p>
            <p className="mt-1 font-medium text-slate-700">{topicLabel}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
