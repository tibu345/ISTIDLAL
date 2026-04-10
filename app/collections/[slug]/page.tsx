import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { VideoCard } from "@/components/VideoCard";
import { getDemoCollectionSlugs, getDemoCollections, getDemoVideos } from "@/lib/demo-content";

type CollectionPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getDemoCollectionSlugs().map((slug) => ({ slug }));
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const videos = getDemoVideos();
  const collection = getDemoCollections().find((entry) => entry.slug === params.slug) ?? null;

  return (
    <>
      <Navbar />
      <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
        {collection ? (
          <div className="space-y-10">
            <PageHeader
              badge="Collection"
              title={collection.title}
              description={collection.summary}
            />

            <section className="panel-card p-5 sm:p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow-label">{collection.browseCategory}</span>
                <span className="meta-chip">{collection.topic}</span>
                <span className="meta-chip">{collection.videoCount} videos</span>
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="eyebrow-label">Start with</p>
                  <h2 className="headline-font mt-2 text-3xl font-bold tracking-tight text-on-background">
                    {collection.starterVideo.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant sm:text-base">
                    This is the strongest starting point in the lane, chosen for clarity, relevance, and enough context to orient the rest of the collection.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/videos/${collection.starterVideo.slug}`} className="primary-button">
                      Start with this video
                    </Link>
                    <Link
                      href={`/categories?category=${encodeURIComponent(collection.browseCategory)}&topic=${encodeURIComponent(collection.topic)}`}
                      className="secondary-button"
                    >
                      View broader topic
                    </Link>
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-surface-container-low p-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Lane signals</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {collection.sharedKeywords.map((keyword) => (
                      <span key={keyword} className="meta-chip">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                    Ordered to stay inside the same topic lane while moving from the starter into stronger follow-up videos.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-end justify-between gap-3">
                <div>
                  <p className="eyebrow-label">Ordered lane</p>
                  <h2 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                    Collection videos
                  </h2>
                </div>
                <p className="text-sm text-on-surface-variant">{collection.videoCount} curated picks</p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {collection.videos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    item={video}
                    reason={index === 0 ? "Starter pick" : index <= 2 ? "Core follow-up" : "Deeper in this lane"}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <EmptyState
              variant="notFound"
              title="Collection not available"
              description="This collection is not strong enough to surface right now. Try the broader topic or browse categories instead."
              ctaLabel="Browse categories"
              ctaHref="/categories"
              secondaryCtaLabel="See homepage collections"
              secondaryCtaHref="/"
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
