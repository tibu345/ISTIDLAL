import Link from "next/link";
import { footerContent } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="mt-12 w-full px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
          <div className="max-w-xl">
            <Link href="/" className="headline-font block text-2xl font-bold tracking-tight text-[#123b39]">
              {footerContent.brand}
            </Link>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {footerContent.description}
            </p>
          </div>

          {footerContent.columns.slice(0, 2).map((column) => (
            <div key={column.heading}>
              <h5 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
                {column.heading}
              </h5>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-[#145b55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eff5f2]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200/70 pt-4 text-sm text-slate-500 sm:flex sm:items-center sm:justify-between">
          <p>{footerContent.copyright}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-0 sm:justify-end">
            <span>Static demo for GitHub Pages</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
