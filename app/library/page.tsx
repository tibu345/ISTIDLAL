import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { PersonalLibrarySection } from "@/components/PersonalLibrarySection";
import { getDemoVideos } from "@/lib/demo-content";

export default async function LibraryPage() {
  const videos = getDemoVideos();

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 sm:pt-28 sm:pb-24">
        <div className="section-shell">
          <PageHeader
            badge="Library"
            title="Continue learning"
            description="Open the library to see what to continue next in the static demo: recent threads first, interest-based follow-ups second, and saved references after that."
          />
        </div>
        <PersonalLibrarySection
          videos={videos}
          showEmptyState
        />
      </main>
      <Footer />
    </>
  );
}
