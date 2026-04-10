import Link from "next/link";
import { withBasePath } from "@/lib/asset-path";
import { heroContent } from "@/lib/site-data";
import { ArrowRightIcon, RocketIcon } from "./icons";

export function HeroSection() {
  return (
    <section className="section-shell relative overflow-hidden pb-14 pt-6 sm:pt-8 lg:pb-18 lg:pt-10">
      <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
        <div className="relative z-10">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0f766e] shadow-[0_10px_26px_rgba(15,23,42,0.06)] sm:text-[11px] sm:tracking-[0.2em]">
            <RocketIcon className="h-4 w-4" />
            <span className="truncate">{heroContent.badge}</span>
          </div>
          <h1 className="headline-font max-w-3xl text-[2.35rem] font-bold leading-[0.96] tracking-tight text-on-background sm:text-5xl lg:text-[4.25rem]">
            {heroContent.titlePrefix}
            <span className="text-[#145b55]">{heroContent.titleHighlight}</span>
            {heroContent.titleSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-on-surface-variant sm:text-[1.075rem]">
            {heroContent.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="inline-flex rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#155c56] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              Guided topics
            </span>
            <span className="inline-flex rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#155c56] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              Category-aware search
            </span>
            <span className="inline-flex rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#155c56] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              Learning flow
            </span>
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/categories"
              className="primary-button w-full gap-2 px-6 py-3.5 sm:w-auto sm:px-7 sm:text-base"
            >
              {heroContent.primaryCta}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/trending"
              className="secondary-button w-full px-6 py-3.5 sm:w-auto sm:px-7 sm:text-base"
            >
              {heroContent.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="relative order-first lg:order-none">
          <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,rgba(20,91,85,0.22),transparent_70%)] blur-2xl" />
          <div className="absolute -left-5 -top-5 h-28 w-28 rounded-full bg-white/55 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.16)] transition-transform duration-500 hover:scale-[1.01]">
            <img
              src={withBasePath(heroContent.dashboardImage)}
              alt=""
              aria-hidden="true"
              className="h-[240px] w-full object-cover sm:h-[320px] md:h-[380px] lg:h-[460px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f1f]/60 via-transparent to-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
