import Link from "next/link";
import type { TopicCollection } from "@/lib/topic-collections";

type TopicCollectionsSectionProps = {
  items: TopicCollection[];
};

export function TopicCollectionsSection({ items }: TopicCollectionsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="section-shell section-spacing">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow-label">Topic Collections</p>
          <h2 className="headline-font mt-3 text-3xl font-bold text-on-background sm:text-4xl">
            Start with stronger learning lanes
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
            Curated topic groupings make it easier to start with a clear idea instead of a raw stream.
          </p>
        </div>
        <Link href="/categories" className="primary-button">
          Explore all categories
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="panel-card flex h-full flex-col p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="meta-chip bg-[#ecfaf5] text-[#145b55]">{item.browseCategory}</span>
              <span className="meta-chip">{item.topic}</span>
            </div>
            <h3 className="headline-font mt-4 text-2xl font-bold tracking-tight text-on-background">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {item.summary}
            </p>
            <div className="mt-5 space-y-3 rounded-[1.5rem] border border-white/75 bg-[#f6fbf8] px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Start with</p>
              <p className="line-clamp-2 text-sm font-semibold text-on-background">{item.starterVideo.title}</p>
              <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Included</p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                {item.videos.slice(0, 3).map((video) => (
                  <li key={video.id} className="line-clamp-1">
                    {video.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto pt-6">
              <Link href={`/collections/${item.slug}`} className="secondary-button w-full justify-center">
                Open collection
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
