import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { VideoCard } from "@/components/VideoCard";
import { getDemoSourceKeys, getDemoSourcePage } from "@/lib/demo-content";

type SourcePageProps = {
  params: {
    key: string;
  };
};

export function generateStaticParams() {
  return getDemoSourceKeys().map((key) => ({ key }));
}

export default async function SourcePage({ params }: SourcePageProps) {
  const source = getDemoSourcePage(params.key);

  return (
    <>
      <Navbar />
      <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
        {source ? (
          <div className="space-y-10">
            <PageHeader
              badge="Trusted learning source"
              title={source.label}
              description={source.displayDescription}
            />

            <section className="panel-card p-5 sm:p-6 md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="meta-chip">{source.topCategory}</span>
                    <span className="meta-chip">{source.learningStyle}</span>
                    <span className="meta-chip">{source.difficultyBias}</span>
                    <span className="meta-chip">{source.videoCount} videos</span>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-on-surface-variant sm:text-base">
                    {source.bestFor}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {source.strengths.map((strength) => (
                      <span key={strength} className="meta-chip">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-surface-container-low p-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Strongest topics</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {source.strongestTopics.map((topic) => (
                      <Link
                        key={topic}
                        href={`/categories?category=${encodeURIComponent(source.topCategory)}&topic=${encodeURIComponent(topic)}`}
                        className="filter-chip"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {source.groupedByTopic.map((group) => (
              <section key={group.topic} className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow-label">Source strength</p>
                    <h2 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                      {group.topic}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                      Strongest videos from {source.label} in this topic lane.
                    </p>
                  </div>
                  <Link
                    href={`/categories?category=${encodeURIComponent(source.topCategory)}&topic=${encodeURIComponent(group.topic)}`}
                    className="secondary-button"
                  >
                    View broader topic
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {group.videos.map((video, index) => (
                    <VideoCard
                      key={video.id}
                      item={video}
                      reason={index === 0 ? `Best ${group.topic} explanation here` : `From ${source.label}`}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <EmptyState
              variant="notFound"
              title="Learning source not available"
              description="This source does not have enough strong stored coverage right now. Try the broader category or another trusted source."
              ctaLabel="Browse categories"
              ctaHref="/categories"
              secondaryCtaLabel="Return home"
              secondaryCtaHref="/"
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
