"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_KEY = "istitdlal-policy-consent-v1";

export function PolicyConsentGate() {
  const pathname = usePathname();
  const [accepted, setAccepted] = useState(true);
  const isPolicyPage = pathname?.endsWith("/privacy") || pathname?.endsWith("/terms");

  useEffect(() => {
    const consentValue = window.localStorage.getItem(CONSENT_KEY);
    setAccepted(consentValue === "accepted");
  }, []);

  if (accepted || isPolicyPage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl shadow-slate-900/15 sm:p-8">
        <p className="eyebrow-label">Before You Browse</p>
        <h2 className="headline-font mt-3 text-2xl font-bold tracking-tight text-on-background sm:text-3xl">
          Review the demo privacy and terms notes
        </h2>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant sm:text-base">
          This GitHub Pages demo is fully static. Saved videos, recently viewed items, and policy
          consent are stored locally in your browser on this device.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/privacy" className="secondary-button justify-center">
            Privacy Policy
          </Link>
          <Link href="/terms" className="secondary-button justify-center">
            Terms of Use
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(CONSENT_KEY, "accepted");
            setAccepted(true);
          }}
          className="primary-button mt-6 w-full justify-center"
        >
          I agree and want to continue
        </button>
      </div>
    </div>
  );
}
