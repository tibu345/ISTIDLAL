import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="section-shell pt-28 pb-24">
        <PageHeader
          badge="About"
          title="Istitdlal is a browse-first educational video platform for science and technology."
          description="This deployment copy is a static GitHub Pages demo that preserves the product story through local curated data, topic-aware browsing, deterministic-looking paths, and focused search."
          className="mb-16 max-w-4xl"
        />

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="panel-card p-8">
            <p className="eyebrow-label">Experience</p>
            <h2 className="headline-font mt-3 text-2xl font-bold text-on-background">What learners can do</h2>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              Browse a curated homepage, move through subject categories and topic lanes, inspect
              trending picks, search the library with stricter category relevance, open individual
              video pages, and keep track of saved or recently viewed videos locally in the browser.
            </p>
          </div>

          <div className="panel-card p-8">
            <p className="eyebrow-label">Foundation</p>
            <h2 className="headline-font mt-3 text-2xl font-bold text-on-background">Technical architecture</h2>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              Under the UI, Next.js statically exports the app, a dedicated demo content layer
              supplies believable local records, and the curation logic still shapes categories,
              collections, search results, and continuation flows without a backend.
            </p>
          </div>
        </section>

        <section className="panel-card mt-8 p-8 lg:p-10">
          <p className="eyebrow-label">Project Summary</p>
          <h2 className="headline-font mt-3 text-2xl font-bold text-on-background">What has been built so far</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="stat-tile">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Content pipeline</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                A deterministic local content catalog with explicit source cues, topic labels,
                progression hints, related videos, and next-step recommendations.
              </p>
            </div>
            <div className="stat-tile">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Discovery layer</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Homepage curation, trending surfaces, category and topic browsing, video detail
                pages, and stricter category-aware search.
              </p>
            </div>
            <div className="stat-tile">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Persistence model</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Browser-only personalization through local saved and recent state, with no account,
                no secret keys, no Prisma runtime, and no server dependency.
              </p>
            </div>
            <div className="stat-tile">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Product stance</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Browse-first educational discovery, topic-led organization, and a learning-first
                experience rather than a generic thumbnail wall.
              </p>
            </div>
          </div>
        </section>

        <section className="panel-card mt-8 p-8 lg:p-10">
          <p className="eyebrow-label">Demo scope</p>
          <h2 className="headline-font mt-3 text-2xl font-bold text-on-background">What this public deployment intentionally omits</h2>
          <p className="mt-4 max-w-4xl leading-relaxed text-on-surface-variant">
            This version omits live ingestion, diagnostics, runtime refresh, Prisma persistence,
            and any feature that would need secrets or a backend. The original full local version
            remains separate from this static deployment copy.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
