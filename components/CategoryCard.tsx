import type { CategoryItem } from "@/lib/site-data";
import Link from "next/link";

export function CategoryCard({ item }: { item: CategoryItem }) {
  return (
    <Link
      href={`/categories?category=${encodeURIComponent(item.browseCategory)}`}
      className={`${item.className} surface-link group interactive-panel relative min-h-[240px] overflow-hidden rounded-[1.75rem] bg-surface-container-low shadow-[0_18px_40px_rgba(15,23,42,0.1)]`}
    >
      <img
        src={item.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-1000 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#081212]/92 via-[#081212]/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_35%)] opacity-60" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <div className="max-w-md rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(9,20,20,0.16),rgba(9,20,20,0.58))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Category</p>
          <h3
            className={`headline-font mb-2 mt-2 font-bold tracking-tight text-white ${
              item.title === "AI & Tech" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {item.title}
          </h3>
          <p className="text-sm leading-6 text-slate-200 sm:text-[15px]">{item.description}</p>
        </div>
      </div>
    </Link>
  );
}
