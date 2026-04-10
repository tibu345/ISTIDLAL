import { PageLoadingState } from "@/components/PageLoadingState";

export default function Loading() {
  return <PageLoadingState title="Loading video" description="Preparing the video page." cardCount={3} />;
}
