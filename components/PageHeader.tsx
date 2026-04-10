type PageHeaderProps = {
  title: string;
  description: string;
  badge?: string;
  className?: string;
};

export function PageHeader({
  title,
  description,
  badge,
  className = "mb-10 max-w-3xl sm:mb-12",
}: PageHeaderProps) {
  return (
    <div className={`${className} relative`}>
      {badge ? (
        <span className="mb-4 inline-flex rounded-full border border-white/80 bg-white/92 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f766e] shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
          {badge}
        </span>
      ) : null}
      <h1 className="headline-font text-4xl font-bold leading-[0.98] tracking-tight text-on-background sm:text-[2.75rem] lg:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-on-surface-variant sm:mt-4 sm:text-lg">
        {description}
      </p>
    </div>
  );
}
