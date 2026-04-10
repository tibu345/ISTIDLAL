type PageLoadingStateProps = {
  title?: string;
  description?: string;
  cardCount?: number;
};

export function PageLoadingState({
  title = "Loading",
  description = "Preparing the next learning surface.",
  cardCount = 6,
}: PageLoadingStateProps) {
  return (
    <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
      <div className="animate-pulse">
        <div className="mb-10 max-w-3xl">
          <div className="h-7 w-28 rounded-full bg-slate-200" />
          <div className="mt-5 h-12 w-3/4 rounded-2xl bg-slate-200" />
          <div className="mt-4 h-5 w-2/3 rounded-full bg-slate-200" />
          <div className="mt-2 h-5 w-1/2 rounded-full bg-slate-200" />
        </div>

        <div className="panel-card p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="h-6 w-40 rounded-full bg-slate-200" />
            <div className="h-4 w-64 rounded-full bg-slate-200" />
            <div className="flex flex-wrap gap-3">
              <div className="h-11 w-28 rounded-full bg-slate-200" />
              <div className="h-11 w-32 rounded-full bg-slate-200" />
              <div className="h-11 w-24 rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: cardCount }).map((_, index) => (
              <div key={index} className="panel-card overflow-hidden p-3 sm:p-4">
                <div className="aspect-video rounded-[1.25rem] bg-slate-200" />
                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-24 rounded-full bg-slate-200" />
                  <div className="h-6 w-20 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 h-6 w-5/6 rounded-full bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded-full bg-slate-200" />
                <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-200" />
                <div className="mt-5 h-5 w-28 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sr-only">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </main>
  );
}
