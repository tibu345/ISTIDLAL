import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { TrendingBrowser } from "@/components/TrendingBrowser";
import { getDemoExploreNowSections } from "@/lib/demo-content";

export default async function TrendingPage() {
  const sections = getDemoExploreNowSections();

  return (
    <>
      <Navbar />
      <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
        <TrendingBrowser sections={sections} />
      </main>
      <Footer />
    </>
  );
}
