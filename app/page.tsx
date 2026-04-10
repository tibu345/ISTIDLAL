import { CategoriesSection } from "@/components/CategoriesSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HomeResumeSection } from "@/components/HomeResumeSection";
import { Navbar } from "@/components/Navbar";
import { TopicCollectionsSection } from "@/components/TopicCollectionsSection";
import { TrendingSection } from "@/components/TrendingSection";
import { getDemoHomepageData } from "@/lib/demo-content";

export default async function Page() {
  const { videos, categories, topicCollections, homepageTrendingItems } = getDemoHomepageData();

  return (
    <>
      <Navbar />
      <main className="pt-28 lg:pt-36">
        <HomeResumeSection videos={videos} />
        <HeroSection />
        <CategoriesSection items={categories} />
        <TopicCollectionsSection items={topicCollections} />
        <TrendingSection items={homepageTrendingItems} />
      </main>
      <Footer />
    </>
  );
}
