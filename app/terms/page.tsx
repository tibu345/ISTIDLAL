import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout label="Terms of Use" title="Terms for using Istitdlal">
      <p>
        This repository copy of ISTIDLAL is a static public demo for GitHub Pages. It provides a
        browse-first interface for curated science and technology discovery using local demo data.
      </p>
      <p>
        The demo is provided as-is for product presentation and interface review. It does not
        promise live ingestion, real-time freshness, or backend-backed persistence.
      </p>
      <p>
        Saved and recently viewed behavior is local to the browser on your device. Clearing browser
        storage will remove that local state.
      </p>
      <p>
        Some pages may link to third-party sources for reference, but this demo does not host any
        external video runtime of its own and does not require any external credentials.
      </p>
      <p>
        The original full local version remains separate and may support features that are
        intentionally omitted from this static deployment.
      </p>
    </LegalPageLayout>
  );
}
