import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PersonalizedVideoSuggestions } from "@/components/PersonalizedVideoSuggestions";
import { RemoteImage } from "@/components/RemoteImage";
import { VideoCard } from "@/components/VideoCard";
import { VideoPersonalizationPanel } from "@/components/VideoPersonalizationPanel";
import { getDemoVideoSlugs, getDemoVideos } from "@/lib/demo-content";
import type { VideoItem } from "@/lib/site-data";
import { buildVideoPageViewModel } from "@/lib/video-page-shaping";

type VideoPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getDemoVideoSlugs().map((slug) => ({ slug }));
}

type DiscoverySectionProps = {
  title: string;
  description: string;
  items: VideoItem[];
  reason?: string;
};

function DiscoverySection({ title, description, items, reason }: DiscoverySectionProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        variant="related"
        compact
        title={title}
        description={description}
        ctaLabel="Open Explore Now"
        ctaHref="/trending"
        secondaryCtaLabel="Open categories"
        secondaryCtaHref="/categories"
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="eyebrow-label">Discover More</p>
        <h2 className="headline-font text-2xl font-bold tracking-tight text-on-background">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <VideoCard key={item.id} item={item} reason={reason} />
        ))}
      </div>
    </section>
  );
}

export default async function VideoPage({ params }: VideoPageProps) {
  const videos = getDemoVideos();
  const videoPage = buildVideoPageViewModel(videos, params.slug);
  const { video } = videoPage;
  const topicLabel = video ? videoPage.primaryTopic || videoPage.topics[0] || "General" : "General";

  return (
    <>
      <Navbar />
      <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
        {video ? (
          <div className="mx-auto max-w-6xl">
            <Link
              href="/"
              className="mb-6 inline-flex text-sm font-semibold text-primary transition-opacity hover:opacity-80"
            >
              Back to home
            </Link>

            <section className="mb-12">
              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                  {videoPage.browseCategory}
                </span>
                {videoPage.topics.slice(0, 2).map((topic) => (
                  <span key={topic} className="meta-chip">
                    {topic}
                  </span>
                ))}
                {videoPage.trustLabel ? <span className="meta-chip">{videoPage.trustLabel}</span> : null}
                {videoPage.levelLabel ? <span className="meta-chip">{videoPage.levelLabel}</span> : null}
                <span className="meta-chip">{video.duration}</span>
                <span className="meta-chip">{video.publishedAt}</span>
              </div>

              <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
                <div className="space-y-6">
                  <div>
                    <h1 className="headline-font text-3xl font-bold leading-tight tracking-tight text-on-background sm:text-4xl xl:text-5xl">
                      {video.title}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                      <span className="font-medium text-on-background">{video.channel}</span>
                      <span className="h-1 w-1 rounded-full bg-outline-variant" />
                      <span>{video.publishedAt}</span>
                      <span className="h-1 w-1 rounded-full bg-outline-variant" />
                      <span>{video.duration}</span>
                      {video.source ? (
                        <>
                          <span className="h-1 w-1 rounded-full bg-outline-variant" />
                          <span>{video.source === "youtube" ? "YouTube source" : "Stored source"}</span>
                        </>
                      ) : null}
                    </div>
                    {videoPage.youtubeHref ? (
                      <div className="mt-4">
                        <a
                          href={videoPage.youtubeHref}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-button"
                        >
                          Watch original on YouTube
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div className="panel-card overflow-hidden p-3 sm:p-4">
                    {videoPage.canEmbed ? (
                      <div className="media-frame overflow-hidden rounded-[1.5rem] bg-surface-container-lowest shadow-sm">
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                            title={video.title}
                            className="h-full w-full border-0"
                            loading="lazy"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="media-frame overflow-hidden">
                          <RemoteImage
                              src={video.thumbnail}
                              alt={video.alt}
                              youtubeVideoId={video.youtubeVideoId}
                              className={`aspect-video w-full ${
                              videoPage.useContainedMedia ? "bg-slate-100 object-contain p-4" : "object-cover"
                            }`}
                          />
                        </div>
                      <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-8 text-center">
                        <span className="headline-font text-lg font-semibold text-on-surface-variant">
                          This static demo keeps the learning surface and omits inline playback.
                        </span>
                          {videoPage.youtubeHref ? (
                            <div className="mt-4">
                              <a
                                href={videoPage.youtubeHref}
                                target="_blank"
                                rel="noreferrer"
                                className="primary-button"
                              >
                                Watch on YouTube
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="panel-card p-6 sm:p-8">
                    <p className="eyebrow-label">Overview</p>
                    <h2 className="headline-font mt-2 text-2xl font-bold tracking-tight text-on-background">
                      About this video
                    </h2>
                    <p className="mt-4 text-base leading-8 text-on-surface-variant sm:text-lg">
                      {video.description}
                    </p>
                  </div>
                </div>

                <aside className="space-y-4 xl:sticky xl:top-24">
                  <VideoPersonalizationPanel slug={video.slug} />

                  <div className="panel-card p-5 sm:p-6">
                    <p className="eyebrow-label">Context</p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Channel</p>
                        <p className="mt-1 font-semibold text-on-background">{video.channel}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Topic</p>
                        <p className="mt-1 font-semibold text-on-background">{topicLabel}</p>
                      </div>
                      {videoPage.trustLabel || videoPage.levelLabel ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {videoPage.trustLabel ? <span className="meta-chip">{videoPage.trustLabel}</span> : null}
                          {videoPage.levelLabel ? <span className="meta-chip">{videoPage.levelLabel}</span> : null}
                        </div>
                      ) : null}
                      {videoPage.youtubeHref ? (
                        <a
                          href={videoPage.youtubeHref}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-button w-full justify-start"
                        >
                          Open original source
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="panel-card p-5 sm:p-6">
                    <p className="eyebrow-label">Learning path</p>
                    {videoPage.learningPath ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl bg-slate-50 px-4 py-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                            {videoPage.learningPath.topic}
                          </p>
                          <p className="mt-1 font-semibold text-on-background">{videoPage.learningPath.title}</p>
                          <p className="mt-2 text-sm text-on-surface-variant">
                            {videoPage.learningPathProgress
                              ? `Step ${videoPage.learningPathProgress.currentIndex + 1} of ${videoPage.learningPath.steps.length} in an ordered ${videoPage.browseCategory.toLowerCase()} progression.`
                              : `${videoPage.learningPath.steps.length} ordered steps in this topic lane.`}
                          </p>
                        </div>
                        <div className="grid gap-3">
                          {videoPage.learningPath.steps.map((step) => {
                            const isCurrent = step.video.slug === video.slug;

                            return (
                              <div
                                key={step.video.id}
                                className={`rounded-2xl px-4 py-3 ${
                                  isCurrent ? "bg-primary text-white" : "bg-slate-50"
                                }`}
                              >
                                <p
                                  className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                                    isCurrent ? "text-white/75" : "text-slate-500"
                                  }`}
                                >
                                  Step {step.index + 1}{step.label ? ` • ${step.label}` : ""}
                                </p>
                                <p className="mt-1 font-semibold">{step.video.title}</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="grid gap-3">
                          {videoPage.learningPathProgress?.nextStep ? (
                            <Link
                              href={`/videos/${videoPage.learningPathProgress.nextStep.video.slug}`}
                              className="primary-button w-full justify-start"
                            >
                              Continue path
                            </Link>
                          ) : (
                            <Link href={`/videos/${videoPage.learningPath.steps[0]?.video.slug}`} className="secondary-button w-full justify-start">
                              Start learning path
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-on-surface-variant">
                        No strong path for this video yet.
                      </div>
                    )}
                  </div>

                  <div className="panel-card p-5 sm:p-6">
                    <p className="eyebrow-label">Explore more</p>
                    <div className="mt-4 grid gap-3">
                      <Link
                        href={`/categories?category=${encodeURIComponent(videoPage.browseCategory)}`}
                        className="secondary-button w-full justify-start"
                      >
                        Explore this category
                      </Link>
                      <Link href="/trending" className="secondary-button w-full justify-start">
                        Open Explore Now
                      </Link>
                      <Link href={`/search?q=${encodeURIComponent(topicLabel)}`} className="secondary-button w-full justify-start">
                        Search this topic
                      </Link>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            <div className="space-y-12">
              {videoPage.relatedLearningPaths.length > 0 ? (
                <section className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <p className="eyebrow-label">Learning paths</p>
                    <h2 className="headline-font text-2xl font-bold tracking-tight text-on-background">
                      More structured paths in {videoPage.browseCategory}
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
                      Example topic progressions built from the same library.
                    </p>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-3">
                    {videoPage.relatedLearningPaths.map((path) => (
                      <div key={path.id} className="panel-card p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="eyebrow-label">{path.topic}</span>
                          {path.level ? <span className="meta-chip">{path.level}</span> : null}
                          <span className="meta-chip">{path.steps.length} steps</span>
                        </div>
                        <h3 className="headline-font mt-3 text-xl font-bold tracking-tight text-on-background">
                          {path.title}
                        </h3>
                        <ol className="mt-4 space-y-2 text-sm text-on-surface-variant">
                          {path.steps.slice(0, 4).map((step) => (
                            <li key={step.video.id}>
                              {step.index + 1}. {step.label ? `${step.label}: ` : ""}
                              {step.video.title}
                            </li>
                          ))}
                        </ol>
                        <div className="mt-5">
                          <Link href={`/videos/${path.steps[0]?.video.slug}`} className="primary-button">
                            Start learning path
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {videoPage.discoverySections.map((section) => (
                <DiscoverySection
                  key={section.key}
                  title={section.title}
                  description={section.description}
                  items={section.items}
                  reason={section.reason}
                />
              ))}
              <PersonalizedVideoSuggestions videos={videos} currentSlug={video.slug} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <EmptyState
              variant="notFound"
              title="Video not found"
              description="The requested video could not be found in the current library. Try browsing categories, Explore Now, or a new search."
              ctaHref="/"
              ctaLabel="Return Home"
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
