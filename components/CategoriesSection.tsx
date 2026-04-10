import Link from "next/link";
import type { CategoryItem } from "@/lib/site-data";
import { categoriesSection } from "@/lib/site-data";
import { CategoryCard } from "./CategoryCard";

type CategoriesSectionProps = {
  items: CategoryItem[];
};

export function CategoriesSection({ items }: CategoriesSectionProps) {
  return (
    <section className="section-shell section-spacing">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow-label">Browse</p>
          <h2 className="headline-font mt-3 text-3xl font-bold text-on-background sm:text-4xl">
            {categoriesSection.heading}
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
            Browse the library by major topic area.
          </p>
        </div>
        <Link href="/categories" className="primary-button">
          View Categories
        </Link>
      </div>
      <div className="grid h-auto grid-cols-1 gap-5 md:h-[520px] md:grid-cols-12">
        {items.map((category) => (
          <CategoryCard key={category.title} item={category} />
        ))}
      </div>
    </section>
  );
}
