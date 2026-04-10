import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SearchExperience } from "@/components/SearchExperience";

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
        <SearchExperience />
      </main>
      <Footer />
    </>
  );
}
