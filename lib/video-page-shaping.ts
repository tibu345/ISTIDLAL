import { getBrowseCategoryForVideo, getVideoLevelLabel, getVideoTrustLabel, type VideoItem } from "@/lib/site-data";
import { getRelatedVideosForTopic, getTopicsForVideo, hasPlayableYouTubeId, isLikelyVerticalThumbnail } from "@/lib/video-curation";
import { buildLearningPaths, getLearningPathForVideo, getLearningPathProgress } from "@/lib/learning-paths";

export function buildVideoPageViewModel(videos: VideoItem[], slug: string) {
  const video = videos.find((item) => item.slug === slug) ?? null;

  if (!video) {
    return {
      video: null,
    };
  }

  const useContainedMedia = video.isShortForm || isLikelyVerticalThumbnail(video);
  const canEmbed = hasPlayableYouTubeId(video);
  const youtubeHref = video.youtubeVideoId ? `https://www.youtube.com/watch?v=${video.youtubeVideoId}` : null;
  const browseCategory = getBrowseCategoryForVideo(video);
  const topics = getTopicsForVideo(video, browseCategory);
  const primaryTopic = topics[0] ?? null;
  const trustLabel = getVideoTrustLabel(video);
  const levelLabel = getVideoLevelLabel(video);
  const learningPath = getLearningPathForVideo(videos, video.slug);
  const learningPathProgress = learningPath ? getLearningPathProgress(learningPath, video.slug) : null;
  const relatedLearningPaths = buildLearningPaths(
    videos.filter((item) => getBrowseCategoryForVideo(item) === browseCategory),
    { category: browseCategory, maxPaths: 3 },
  ).filter((path) => path.id !== learningPath?.id);
  const relatedPool = videos.filter((item) => item.slug !== video.slug);
  const sameChannelVideos = relatedPool.filter((item) => item.channel === video.channel).slice(0, 3);
  const sameTopicVideos =
    primaryTopic
      ? getRelatedVideosForTopic(relatedPool, browseCategory, primaryTopic, 3).filter(
          (item) => item.channel !== video.channel,
        )
      : [];
  const excludedDiscoverySlugs = new Set([
    ...sameChannelVideos.map((item) => item.slug),
    ...sameTopicVideos.map((item) => item.slug),
  ]);
  const sameCategoryVideos = relatedPool
    .filter(
      (item) => getBrowseCategoryForVideo(item) === browseCategory && !excludedDiscoverySlugs.has(item.slug),
    )
    .slice(0, 3);

  return {
    video,
    useContainedMedia,
    canEmbed,
    youtubeHref,
    browseCategory,
    topics,
    primaryTopic,
    trustLabel,
    levelLabel,
    learningPath,
    learningPathProgress,
    relatedLearningPaths,
    discoverySections: [
      {
        key: "same-channel",
        title: `More from ${video.channel}`,
        description: "More videos from the same trusted source or channel lane.",
        items: sameChannelVideos,
        reason: "Same channel",
        variant: "related" as const,
      },
      {
        key: "same-topic",
        title: primaryTopic ? `More on ${primaryTopic}` : "Related videos",
        description: "The closest topical continuation in the current library.",
        items: sameTopicVideos,
        reason: primaryTopic ? `Related to ${primaryTopic}` : "Related topic",
        variant: "related" as const,
      },
      {
        key: "same-category",
        title: `More in ${browseCategory}`,
        description: "More strong videos from the same category lane.",
        items: sameCategoryVideos,
        reason: `Strong match for ${browseCategory}`,
        variant: "related" as const,
      },
    ],
  };
}
