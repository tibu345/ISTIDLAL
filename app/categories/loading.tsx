import { PageLoadingState } from "@/components/PageLoadingState";

export default function Loading() {
  return <PageLoadingState title="Loading categories" description="Preparing category browsing." cardCount={6} />;
}
