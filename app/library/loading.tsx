import { PageLoadingState } from "@/components/PageLoadingState";

export default function Loading() {
  return <PageLoadingState title="Loading library" description="Preparing your saved and recent videos." cardCount={4} />;
}
