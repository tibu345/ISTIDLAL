import { PageLoadingState } from "@/components/PageLoadingState";

export default function Loading() {
  return <PageLoadingState title="Loading home" description="Preparing the homepage." cardCount={6} />;
}
