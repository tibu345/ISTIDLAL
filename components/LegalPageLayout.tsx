import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

type LegalPageLayoutProps = {
  label: string;
  title: string;
  children: ReactNode;
};

export function LegalPageLayout({ label, title, children }: LegalPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="section-shell pt-24 pb-20 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.16),0_18px_40px_rgba(15,23,42,0.06)] sm:p-8">
          <p className="eyebrow-label">{label}</p>
          <h1 className="headline-font mt-3 text-3xl font-bold tracking-tight text-on-background sm:text-4xl">
            {title}
          </h1>
          <div className="mt-6 space-y-6 text-sm leading-7 text-on-surface-variant sm:text-base">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
