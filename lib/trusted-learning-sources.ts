import { getBrowseCategoryForVideo, type BrowseCategory, type VideoItem } from "@/lib/site-data";
import { type YouTubeChannelSource, youtubeChannels } from "@/lib/sources/youtube-channels";
import { getTopicsForVideo } from "@/lib/video-curation";

export type TrustedLearningSourceSummary = {
  key: string;
  label: string;
  displayDescription: string;
  learningStyle: string;
  difficultyBias: string;
  bestFor: string;
  strengths: string[];
  videoCount: number;
  topCategory: BrowseCategory;
  categories: BrowseCategory[];
  strongestTopics: string[];
  score: number;
};

export type TrustedLearningSourcePage = TrustedLearningSourceSummary & {
  channel: YouTubeChannelSource;
  videos: VideoItem[];
  groupedByTopic: Array<{
    topic: string;
    videos: VideoItem[];
  }>;
};

function getChannelVideoGroups(videos: VideoItem[]) {
  return videos.reduce<
    Map<
      string,
      {
        label: string;
        videoCount: number;
        categoryCounts: Map<BrowseCategory, number>;
        topicCounts: Map<string, number>;
        qualityTotal: number;
        confidenceTotal: number;
      }
    >
  >((accumulator, video) => {
    if (!video.trustedChannelKey && !video.trustedSource) {
      return accumulator;
    }

    const key = video.trustedChannelKey ?? video.channel;
    const entry = accumulator.get(key) ?? {
      label: video.channel,
      videoCount: 0,
      categoryCounts: new Map<BrowseCategory, number>(),
      topicCounts: new Map<string, number>(),
      qualityTotal: 0,
      confidenceTotal: 0,
    };
    const category = getBrowseCategoryForVideo(video);

    entry.videoCount += 1;
    entry.qualityTotal += Math.max(0, video.qualityScore ?? video.curationScore ?? 0);
    entry.confidenceTotal += video.classificationConfidence ?? 0;
    entry.categoryCounts.set(category, (entry.categoryCounts.get(category) ?? 0) + 1);

    getTopicsForVideo(video, category).forEach((topic) => {
      entry.topicCounts.set(topic, (entry.topicCounts.get(topic) ?? 0) + 1);
    });

    accumulator.set(key, entry);
    return accumulator;
  }, new Map());
}

export function buildTrustedLearningSourceSummaries(
  videos: VideoItem[],
  options?: { category?: BrowseCategory | null; limit?: number },
): TrustedLearningSourceSummary[] {
  const grouped = getChannelVideoGroups(videos);
  const limit = options?.limit ?? 3;

  const summaries = youtubeChannels
    .map((channel) => {
      const entry = grouped.get(channel.key);

      if (!entry || entry.videoCount === 0) {
        return null;
      }

      const orderedCategories = [...entry.categoryCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .map(([category]) => category);
      const strongestTopics = [...entry.topicCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .map(([topic]) => topic)
        .slice(0, 3);
      const averageQuality = entry.qualityTotal / entry.videoCount;
      const averageConfidence = entry.confidenceTotal / entry.videoCount;
      const categoryRelevance =
        options?.category && orderedCategories.includes(options.category)
          ? 6
          : options?.category
            ? -2
            : 0;

      const summary: TrustedLearningSourceSummary = {
        key: channel.key,
        label: channel.name,
        displayDescription: channel.displayDescription,
        learningStyle: channel.learningStyle,
        difficultyBias: channel.difficultyBias,
        bestFor: channel.bestFor,
        strengths: channel.strengths,
        videoCount: entry.videoCount,
        topCategory: orderedCategories[0] ?? channel.defaultCategory,
        categories: orderedCategories,
        strongestTopics,
        score: entry.videoCount * 2 + averageQuality * 0.8 + averageConfidence * 10 + categoryRelevance,
      };

      return summary;
    })
    .filter((entry): entry is TrustedLearningSourceSummary => entry !== null);

  return summaries.sort((left, right) => right.score - left.score).slice(0, limit);
}

export function getTrustedLearningSourcePage(videos: VideoItem[], key: string): TrustedLearningSourcePage | null {
  const channel = youtubeChannels.find((entry) => entry.key === key);

  if (!channel) {
    return null;
  }

  const sourceVideos = videos
    .filter((video) => (video.trustedChannelKey ?? video.channel) === key || video.channel === channel.name)
    .sort((left, right) => {
      if ((right.qualityScore ?? right.curationScore ?? 0) !== (left.qualityScore ?? left.curationScore ?? 0)) {
        return (right.qualityScore ?? right.curationScore ?? 0) - (left.qualityScore ?? left.curationScore ?? 0);
      }

      return (right.classificationConfidence ?? 0) - (left.classificationConfidence ?? 0);
    });

  if (sourceVideos.length === 0) {
    return null;
  }

  const summary = buildTrustedLearningSourceSummaries(sourceVideos, { limit: 1 })[0];

  if (!summary) {
    return null;
  }

  const groupedByTopic = summary.strongestTopics.map((topic) => ({
    topic,
    videos: sourceVideos.filter((video) =>
      getTopicsForVideo(video, getBrowseCategoryForVideo(video)).includes(topic),
    ).slice(0, 4),
  })).filter((group) => group.videos.length > 0);

  return {
    ...summary,
    channel,
    videos: sourceVideos,
    groupedByTopic,
  };
}
