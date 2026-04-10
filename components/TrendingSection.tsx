import Link from "next/link";
import type { TrendingItem } from "@/lib/site-data";
import { trendingSection } from "@/lib/site-data";
import { TrendingListItem } from "./TrendingListItem";

type TrendingSectionProps = {
  items: TrendingItem[];
};

export function TrendingSection({ items }: TrendingSectionProps) {
  const previewItems = items.slice(0, 3);

  return (
    <section className="section-spacing bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(225,236,232,0.72))]">
      <div className="section-shell">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow-label">Explore now</p>
            <h2 className="headline-font mt-3 text-3xl font-bold text-on-background sm:text-4xl">
              {trendingSection.heading}
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
              {trendingSection.description}
            </p>
          </div>
          <Link href="/trending" className="primary-button">
            Open Explore Now
          </Link>
        </div>
        <div className="space-y-5">
          {previewItems.map((item) => (
            <TrendingListItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
