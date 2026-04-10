import Link from "next/link";

type EmptyStateVariant = "default" | "search" | "sparse" | "saved" | "recent" | "related" | "notFound";

type EmptyStateProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  tips?: string[];
  eyebrow?: string;
  className?: string;
  variant?: EmptyStateVariant;
  compact?: boolean;
};

const emptyStateVariantConfig: Record<
  EmptyStateVariant,
  {
    eyebrow: string;
    title: string;
    description: string;
    shellClassName: string;
    iconClassName: string;
    dotClassName: string;
    eyebrowClassName: string;
  }
> = {
  default: {
    eyebrow: "Browse-first experience",
    title: "Nothing to show yet",
    description: "Try another route through the library to pick up stronger signals.",
    shellClassName: "bg-gradient-to-br from-indigo-50 via-white to-sky-50",
    iconClassName: "border-white bg-white/90 shadow-sm shadow-slate-200/80",
    dotClassName: "bg-primary",
    eyebrowClassName: "border-slate-200 bg-slate-50 text-slate-500",
  },
  search: {
    eyebrow: "Search guidance",
    title: "No strong search results",
    description: "Try a broader topic, a nearby category, or a simpler phrasing of the idea.",
    shellClassName: "bg-gradient-to-br from-sky-50 via-white to-indigo-50",
    iconClassName: "border-white bg-white/95 shadow-sm shadow-slate-200/80",
    dotClassName: "bg-sky-500",
    eyebrowClassName: "border-sky-100 bg-sky-50 text-sky-700",
  },
  sparse: {
    eyebrow: "Coverage is light",
    title: "This lane is quiet right now",
    description: "The library does not have enough strong videos here yet, so it is better to pivot than fill the page with weak matches.",
    shellClassName: "bg-gradient-to-br from-amber-50 via-white to-orange-50",
    iconClassName: "border-white bg-white/95 shadow-sm shadow-amber-100/80",
    dotClassName: "bg-amber-500",
    eyebrowClassName: "border-amber-100 bg-amber-50 text-amber-700",
  },
  saved: {
    eyebrow: "Library",
    title: "No saved videos yet",
    description: "Save strong videos as you browse so the best ones stay easy to revisit.",
    shellClassName: "bg-gradient-to-br from-slate-50 via-white to-indigo-50",
    iconClassName: "border-white bg-white/95 shadow-sm shadow-slate-200/80",
    dotClassName: "bg-indigo-500",
    eyebrowClassName: "border-slate-200 bg-slate-50 text-slate-600",
  },
  recent: {
    eyebrow: "Library",
    title: "No recent viewing trail yet",
    description: "Open a few videos and the app will keep a lightweight path back to what you explored.",
    shellClassName: "bg-gradient-to-br from-slate-50 via-white to-sky-50",
    iconClassName: "border-white bg-white/95 shadow-sm shadow-slate-200/80",
    dotClassName: "bg-sky-500",
    eyebrowClassName: "border-slate-200 bg-slate-50 text-slate-600",
  },
  related: {
    eyebrow: "Keep exploring",
    title: "No closely related videos yet",
    description: "This part of the library is thin right now. Try the broader category or Explore Now instead.",
    shellClassName: "bg-gradient-to-br from-slate-50 via-white to-slate-100",
    iconClassName: "border-white bg-white/95 shadow-sm shadow-slate-200/80",
    dotClassName: "bg-slate-500",
    eyebrowClassName: "border-slate-200 bg-slate-50 text-slate-600",
  },
  notFound: {
    eyebrow: "Unavailable",
    title: "This page could not be found",
    description: "The requested video is not available in the current library.",
    shellClassName: "bg-gradient-to-br from-rose-50 via-white to-slate-50",
    iconClassName: "border-white bg-white/95 shadow-sm shadow-rose-100/70",
    dotClassName: "bg-rose-500",
    eyebrowClassName: "border-rose-100 bg-rose-50 text-rose-700",
  },
};

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  tips,
  eyebrow,
  className,
  variant = "default",
  compact = false,
}: EmptyStateProps) {
  const config = emptyStateVariantConfig[variant];
  const resolvedTitle = title ?? config.title;
  const resolvedDescription = description ?? config.description;
  const resolvedEyebrow = eyebrow ?? config.eyebrow;

  return (
    <div className={`panel-card overflow-hidden text-center ${className ?? ""}`}>
      <div
        className={`${config.shellClassName} ${compact ? "px-5 py-7 sm:px-6 sm:py-8" : "px-6 py-10 sm:px-10 sm:py-12"}`}
      >
        <div
          className={`mx-auto mb-5 flex items-center justify-center rounded-2xl border ${config.iconClassName} ${compact ? "h-12 w-12" : "h-14 w-14"}`}
        >
          <div className={`rounded-full ${config.dotClassName} ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
        </div>
        <h2
          className={`headline-font font-bold tracking-tight text-on-background ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}
        >
          {resolvedTitle}
        </h2>
        <p
          className={`mx-auto mt-3 max-w-2xl text-on-surface-variant ${compact ? "text-sm leading-6" : "text-sm leading-7 sm:text-base"}`}
        >
          {resolvedDescription}
        </p>
        {tips && tips.length > 0 ? (
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
            {tips.map((tip) => (
              <span
                key={tip}
                className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
              >
                {tip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {ctaLabel && ctaHref ? (
        <div className="flex flex-col items-stretch justify-center gap-3 px-6 pb-7 sm:flex-row sm:flex-wrap sm:items-center sm:px-10 sm:pb-8">
          <Link href={ctaHref} className="primary-button mt-1 w-full sm:w-auto">
            {ctaLabel}
          </Link>
          {secondaryCtaLabel && secondaryCtaHref ? (
            <Link href={secondaryCtaHref} className="secondary-button mt-1 w-full sm:w-auto">
              {secondaryCtaLabel}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className={`${compact ? "px-5 pb-6 sm:px-6 sm:pb-7" : "px-6 pb-7 sm:px-10 sm:pb-8"}`}>
          <div
            className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${config.eyebrowClassName}`}
          >
            {resolvedEyebrow}
          </div>
        </div>
      )}
    </div>
  );
}
