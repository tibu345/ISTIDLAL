"use client";

import { FormEvent, useEffect, useState } from "react";
import { navbarLinks } from "@/lib/site-data";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "./icons";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    navbarLinks.forEach((link) => {
      router.prefetch(link.href);
    });
    router.prefetch("/search");
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <header className="glass-effect fixed top-0 z-50 w-full border-b border-white/65 bg-[#edf4f0]/82 shadow-[0_14px_38px_rgba(15,23,42,0.08)]">
      <nav className="section-shell flex min-h-[76px] items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 items-center gap-4 md:gap-6 lg:gap-8">
          <Link href="/" className="min-w-0 flex-1 md:flex-none">
            <span className="headline-font block truncate text-lg font-bold tracking-tight text-[#123b39] sm:text-xl">
              ISTIDLAL
            </span>
            <span className="hidden text-xs font-medium uppercase tracking-[0.14em] text-slate-500 sm:block">
              Science and technology discovery
            </span>
          </Link>
          <div className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/70 p-1 shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:flex">
            {navbarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={
                  pathname === link.href
                    ? "rounded-full bg-[#123b39] px-3 py-2 text-sm font-semibold text-[#f3fffc] shadow-[0_10px_22px_rgba(18,59,57,0.22)] transition-all duration-200 lg:px-4"
                    : "rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-[#f3f8f5] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eff5f2] lg:px-4"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <form
            onSubmit={handleSubmit}
            className="hidden items-center gap-3 rounded-full border border-white/80 bg-white/88 px-4 py-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/15 lg:flex"
          >
            <SearchIcon className="h-[18px] w-[18px] text-on-surface-variant" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search videos..."
              className="w-40 border-none bg-transparent p-0 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-0 lg:w-52"
            />
          </form>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/75 bg-white/90 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eff5f2] md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="flex flex-col gap-1.5">
              <span className={`h-0.5 w-4 rounded-full bg-current transition-transform ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-4 rounded-full bg-current transition-opacity ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`h-0.5 w-4 rounded-full bg-current transition-transform ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="section-shell pb-4 md:hidden">
          <div className="panel-card rounded-[1.5rem] p-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 rounded-full border border-white/75 bg-[#f6fbf8] px-4 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
            >
              <SearchIcon className="h-[18px] w-[18px] text-on-surface-variant" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search videos..."
                className="w-full border-none bg-transparent p-0 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </form>
            <div className="mt-4 grid gap-2">
              {navbarLinks.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "rounded-2xl bg-[#123b39] px-4 py-3 text-sm font-semibold text-[#f4fffd] shadow-[0_10px_24px_rgba(18,59,57,0.18)]"
                        : "rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f2f7f4]"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
