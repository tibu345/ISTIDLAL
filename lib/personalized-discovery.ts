import { getBrowseCategoryForVideo, getVideoLevelLabel, type BrowseCategory, type VideoItem } from "@/lib/site-data";
import { getTopicsForVideo } from "@/lib/video-curation";

export type PersonalizationInput = {
  recentSlugs: string[];
  savedSlugs: string[];
  currentSlug?: string | null;
};

export type PersonalizedRecommendation = {
  video: VideoItem;
  reason: string;
  score: number;
  nextStep: string;
  stepLabel: string | null;
  relatedTopics: string[];
  matchedTopic: string | null;
  matchedCategory: BrowseCategory | null;
  matchedChannel: string | null;
};

export type InterestTopicSummary = {
  topic: string;
  category: BrowseCategory;
  score: number;
  viewedCount: number;
  savedCount: number;
  nextStep: string;
  stepLabel: string | null;
  relatedTopics: string[];
  nextRecommendations: PersonalizedRecommendation[];
};

export type PersonalizedDiscovery = {
  dominantCategory: BrowseCategory | null;
  dominantTopic: string | null;
  dominantChannel: string | null;
  relatedTopics: string[];
  recommendations: PersonalizedRecommendation[];
  interestTopics: InterestTopicSummary[];
};

function createVideoMap(videos: VideoItem[]) {
  return new Map(videos.map((video) => [video.slug, video]));
}

function rankInterestSlugs(input: PersonalizationInput) {
  const ranked: Array<{ slug: string; source: "recent" | "saved"; weight: number }> = [];

  input.recentSlugs.forEach((slug, index) => {
    ranked.push({ slug, source: "recent", weight: Math.max(1, 6 - index) });
  });

  input.savedSlugs.forEach((slug, index) => {
    ranked.push({ slug, source: "saved", weight: Math.max(2, 8 - index) });
  });

  return ranked;
}

function sortEntriesDeterministically<T>(entries: Array<[T, number]>, getLabel: (value: T) => string) {
  return entries.sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return getLabel(left[0]).localeCompare(getLabel(right[0]));
  });
}

function getLightweightStepLabel(signalCount: number, levelLabel: string) {
  const totalSteps = Math.max(3, Math.min(5, signalCount + 2));
  let currentStep = Math.min(totalSteps, Math.max(1, signalCount + 1));

  if (levelLabel === "Advanced" || levelLabel === "Deep dive") {
    currentStep = Math.min(totalSteps, currentStep + 1);
  }

  if (levelLabel === "Beginner" || levelLabel === "Quick start") {
    currentStep = Math.max(1, currentStep - 1);
  }

  return `Step ${currentStep} of ${totalSteps}`;
}

function buildNextStepCopy(topic: string | null, category: BrowseCategory | null, channel: string | null) {
  if (topic) {
    return `Next step: continue with the strongest ${topic.toLowerCase()} follow-up.`;
  }

  if (category) {
    return `Next step: stay in ${category} for the clearest continuation.`;
  }

  if (channel) {
    return `Next step: keep going with ${channel}.`;
  }

  return "Next step: continue with the closest follow-up from your recent activity.";
}

export function buildPersonalizedDiscovery(videos: VideoItem[], input: PersonalizationInput): PersonalizedDiscovery {
  const videoMap = createVideoMap(videos);
  const rankedInterestVideos = rankInterestSlugs(input)
    .map((entry) => ({ ...entry, video: videoMap.get(entry.slug) ?? null }))
    .filter((entry): entry is { slug: string; source: "recent" | "saved"; weight: number; video: VideoItem } => Boolean(entry.video));
  const currentVideo = input.currentSlug ? videoMap.get(input.currentSlug) ?? null : null;
  const excludedSlugs = new Set([
    ...input.recentSlugs,
    ...input.savedSlugs,
    ...(input.currentSlug ? [input.currentSlug] : []),
  ]);
  const categoryScores = new Map<BrowseCategory, number>();
  const topicScores = new Map<string, number>();
  const topicCategoryMap = new Map<string, BrowseCategory>();
  const topicViewedCounts = new Map<string, number>();
  const topicSavedCounts = new Map<string, number>();
  const channelScores = new Map<string, number>();
  const watchedTopic = currentVideo ? getTopicsForVideo(currentVideo, getBrowseCategoryForVideo(currentVideo))[0] ?? null : null;

  for (const entry of rankedInterestVideos) {
    const category = getBrowseCategoryForVideo(entry.video);
    const topics = getTopicsForVideo(entry.video, category);
    const sourceBonus = entry.source === "saved" ? 2 : 0;
    categoryScores.set(category, (categoryScores.get(category) ?? 0) + entry.weight + sourceBonus);
    channelScores.set(entry.video.channel, (channelScores.get(entry.video.channel) ?? 0) + entry.weight);

    for (const topic of topics) {
      topicScores.set(topic, (topicScores.get(topic) ?? 0) + entry.weight + sourceBonus);
      topicCategoryMap.set(topic, category);
      if (entry.source === "recent") {
        topicViewedCounts.set(topic, (topicViewedCounts.get(topic) ?? 0) + 1);
      }
      if (entry.source === "saved") {
        topicSavedCounts.set(topic, (topicSavedCounts.get(topic) ?? 0) + 1);
      }
    }
  }

  if (currentVideo) {
    const category = getBrowseCategoryForVideo(currentVideo);
    categoryScores.set(category, (categoryScores.get(category) ?? 0) + 5);
    channelScores.set(currentVideo.channel, (channelScores.get(currentVideo.channel) ?? 0) + 4);

    for (const topic of getTopicsForVideo(currentVideo, category)) {
      topicScores.set(topic, (topicScores.get(topic) ?? 0) + 5);
      topicCategoryMap.set(topic, category);
      topicViewedCounts.set(topic, (topicViewedCounts.get(topic) ?? 0) + 1);
    }
  }

  const rankedCategories = sortEntriesDeterministically([...categoryScores.entries()], (value) => value);
  const rankedTopics = sortEntriesDeterministically([...topicScores.entries()], (value) => value);
  const rankedChannels = sortEntriesDeterministically([...channelScores.entries()], (value) => value);
  const dominantCategory = rankedCategories[0]?.[0] ?? null;
  const dominantTopic = rankedTopics[0]?.[0] ?? null;
  const dominantChannel = rankedChannels[0]?.[0] ?? null;
  const relatedTopics = rankedTopics
    .map(([topic]) => topic)
    .filter((topic) => topic !== dominantTopic)
    .slice(0, 3);

  const recommendations = videos
    .filter((video) => !excludedSlugs.has(video.slug))
    .map((video) => {
      const category = getBrowseCategoryForVideo(video);
      const topics = getTopicsForVideo(video, category);
      const levelLabel = getVideoLevelLabel(video);
      const matchedTopic =
        rankedTopics.find(([topic]) => topics.includes(topic))?.[0] ??
        (dominantTopic && topics.includes(dominantTopic) ? dominantTopic : null);
      const matchedCategory = dominantCategory && category === dominantCategory ? dominantCategory : null;
      const matchedChannel =
        currentVideo && video.channel === currentVideo.channel
          ? currentVideo.channel
          : dominantChannel && video.channel === dominantChannel
            ? dominantChannel
            : null;
      const topicSignalCount = matchedTopic
        ? (topicViewedCounts.get(matchedTopic) ?? 0) + (topicSavedCounts.get(matchedTopic) ?? 0)
        : input.recentSlugs.length + input.savedSlugs.length;
      let score = Math.max(0, video.curationScore ?? 0) * 0.35 + (video.classificationConfidence ?? 0) * 5;
      let reason = dominantCategory ? `Continue exploring ${dominantCategory}` : "Related to your recent interest";

      if (currentVideo && video.channel === currentVideo.channel) {
        score += 10;
        reason = `From ${currentVideo.channel}`;
      }

      if (dominantChannel && video.channel === dominantChannel) {
        score += 8;
        reason = "From channels you return to";
      }

      if (dominantCategory && category === dominantCategory) {
        score += 12;
        reason = `Continue exploring ${dominantCategory}`;
      }

      if (dominantTopic && topics.includes(dominantTopic)) {
        score += 14;
        reason =
          currentVideo && watchedTopic === dominantTopic
            ? `Because you watched ${dominantTopic}`
            : input.savedSlugs.length > 0
              ? `From your saved topics`
              : `Related to your recent interest in ${dominantTopic}`;
      }

      const additionalTopicMatches = rankedTopics
        .slice(0, 3)
        .filter(([topic]) => topic !== dominantTopic && topics.includes(topic)).length;

      if (additionalTopicMatches > 0) {
        score += additionalTopicMatches * 5;
      }

      if (currentVideo && category === getBrowseCategoryForVideo(currentVideo)) {
        score += 6;
      }

      if (input.savedSlugs.length > 0 && (levelLabel === "Deep dive" || levelLabel === "Advanced")) {
        score += 2;
      }

      if (input.recentSlugs.length > 0 && (levelLabel === "Beginner" || levelLabel === "Quick start")) {
        score += 2;
      }

      if (video.trustedSource) {
        score += 2;
      }

      const recommendationRelatedTopics = topics
        .filter((topic) => topic !== matchedTopic)
        .slice(0, 2);

      return {
        video,
        reason,
        score,
        nextStep: buildNextStepCopy(matchedTopic, matchedCategory, matchedChannel),
        stepLabel: getLightweightStepLabel(topicSignalCount, levelLabel),
        relatedTopics: recommendationRelatedTopics,
        matchedTopic,
        matchedCategory,
        matchedChannel,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if ((right.video.classificationConfidence ?? 0) !== (left.video.classificationConfidence ?? 0)) {
        return (right.video.classificationConfidence ?? 0) - (left.video.classificationConfidence ?? 0);
      }

      if ((right.video.curationScore ?? 0) !== (left.video.curationScore ?? 0)) {
        return (right.video.curationScore ?? 0) - (left.video.curationScore ?? 0);
      }

      return left.video.slug.localeCompare(right.video.slug);
    })
    .slice(0, 4);

  const interestTopics = rankedTopics
    .slice(0, 3)
    .map(([topic, score]) => {
      const category = topicCategoryMap.get(topic) ?? dominantCategory ?? "Science";
      const nextRecommendations = recommendations.filter((entry) =>
        getTopicsForVideo(entry.video, getBrowseCategoryForVideo(entry.video)).includes(topic),
      );
      const signalCount = (topicViewedCounts.get(topic) ?? 0) + (topicSavedCounts.get(topic) ?? 0);

      return {
        topic,
        category,
        score,
        viewedCount: topicViewedCounts.get(topic) ?? 0,
        savedCount: topicSavedCounts.get(topic) ?? 0,
        nextStep: buildNextStepCopy(topic, category, null),
        stepLabel: getLightweightStepLabel(
          signalCount,
          nextRecommendations[0] ? getVideoLevelLabel(nextRecommendations[0].video) : "Guided",
        ),
        relatedTopics: relatedTopics.filter((entry) => entry !== topic).slice(0, 2),
        nextRecommendations: nextRecommendations.slice(0, 2),
      };
    });

  return {
    dominantCategory,
    dominantTopic,
    dominantChannel,
    relatedTopics,
    recommendations,
    interestTopics,
  };
}
