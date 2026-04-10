import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout label="Privacy Policy" title="Privacy and data use">
      <p>
        This GitHub Pages deployment of ISTIDLAL is a fully static demo. It does not use a backend,
        does not call the YouTube API, does not require an account, and does not require any secret
        configuration.
      </p>
      <p>
        All visible content in this demo comes from local curated demo data bundled into the build.
        There is no runtime database and no server-side ingestion process.
      </p>
      <p>
        On this device, the app stores a small amount of local browser data using
        <code className="mx-1">localStorage</code>. That local data includes saved videos,
        recently viewed videos, and policy-consent state.
      </p>
      <p>
        This local data is not tied to an account and does not sync between browsers or devices.
        It exists only in the browser you use to open the demo.
      </p>
      <p>
        If you clear your browser storage, your saved videos and recently viewed history in
        this app will be removed from that browser.
      </p>
      <p>
        The original full local version of the project may use different infrastructure and data
        sources. This policy page describes the static demo deployed from this repository copy.
      </p>
    </LegalPageLayout>
  );
}
