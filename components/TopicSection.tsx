import type { VideoItem } from "@/lib/site-data";
import { VideoCard } from "@/components/VideoCard";
import type { TopicCoverageState } from "@/lib/video-curation";

type TopicSectionProps = {
  title: string;
  description: string;
  videos: VideoItem[];
  coverageState?: TopicCoverageState;
  statusLabel?: string;
  videoReason?: string;
};

export function TopicSection({
  title,
  description,
  videos,
  coverageState = "active",
  statusLabel,
  videoReason,
}: TopicSectionProps) {
  return (
    <section className="panel-card p-5 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-outline-variant/10 pb-6 md:mb-8 md:flex-row md:items-end md:justify-between md:pb-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Topic</p>
          <h3 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background sm:text-[1.75rem]">
            {title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {statusLabel ? (
            <div
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                coverageState === "active"
                  ? "bg-surface-container-high text-on-surface"
                  : coverageState === "light"
                    ? "bg-surface-container-high text-on-surface-variant"
                    : "bg-surface-container text-on-surface-variant/80"
              }`}
            >
              {statusLabel}
            </div>
          ) : null}
          <div className="rounded-full bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface">
            {videos.length} video{videos.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} item={video} reason={videoReason} />
        ))}
      </div>
    </section>
  );
}
