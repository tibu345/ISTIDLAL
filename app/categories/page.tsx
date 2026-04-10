import { CategoriesBrowser } from "@/components/CategoriesBrowser";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getDemoVideos } from "@/lib/demo-content";

export default async function CategoriesPage() {
  const videos = getDemoVideos();

  return (
    <>
      <Navbar />
      <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
        <CategoriesBrowser videos={videos} />
      </main>
      <Footer />
    </>
  );
}
