import type { BrowseCategory, VideoItem } from "@/lib/site-data";
import { getBrowseCategoryForVideo } from "@/lib/site-data";
import {
  buildVideoClusters,
  getPrimaryTopicForVideo,
  getRecencyBonus,
  getTopicMatchesForVideo,
  getTopicsForVideo,
  hasPlayableYouTubeId,
  isGoodFeedCandidate,
  scoreVideoForCuration,
} from "@/lib/video-curation";

export type ExploreNowPick = {
  video: VideoItem;
  label: string;
  reason: string;
};

export type ExploreNowGroup = {
  id: string;
  title: string;
  description: string;
  category: BrowseCategory | "All";
  items: ExploreNowPick[];
};

const CATEGORY_ORDER: BrowseCategory[] = ["AI & Tech", "Physics", "Mathematics", "Science"];
const MIN_NOW_CONFIDENCE = 0.7;
const MIN_CATEGORY_SECTION_ITEMS = 2;
const RECENT_TOPIC_WINDOW_HOURS = 14 * 24;

function getEffectiveQualityScore(video: VideoItem) {
  return video.qualityScore ?? video.curationScore ?? scoreVideoForCuration(video);
}

function getConfidenceScore(video: VideoItem) {
  return (video.classificationConfidence ?? 0.6) * 10;
}

function getPublishedTimestamp(video: VideoItem) {
  return video.publishedAtISO ? new Date(video.publishedAtISO).getTime() : 0;
}

function getAgeHours(video: VideoItem) {
  const publishedTimestamp = getPublishedTimestamp(video);

  if (!publishedTimestamp) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, (Date.now() - publishedTimestamp) / (1000 * 60 * 60));
}

function getFreshnessScore(video: VideoItem) {
  const ageHours = getAgeHours(video);

  if (ageHours <= 24) return 4;
  if (ageHours <= 72) return 2.75;
  if (ageHours <= 7 * 24) return 1.5;
  if (ageHours <= 14 * 24) return 0.75;
  return 0;
}

function getTopicStrength(video: VideoItem) {
  const category = getBrowseCategoryForVideo(video);
  const strongestTopicMatch = getTopicMatchesForVideo(video, category)[0]?.score ?? 0;
  const topicCoverage = getTopicsForVideo(video, category).length;

  return Math.min(6.5, strongestTopicMatch * 0.45) + Math.min(2, topicCoverage) * 0.8;
}

function getTrustedSourceBonus(video: VideoItem) {
  return video.trustedSource || video.trustedChannelKey ? 1 : 0;
}

function getCategoryCounts(items: VideoItem[]) {
  return items.reduce<Record<BrowseCategory, number>>(
    (accumulator, item) => {
      const category = getBrowseCategoryForVideo(item);
      accumulator[category] = (accumulator[category] ?? 0) + 1;
      return accumulator;
    },
    {
      "AI & Tech": 0,
      Physics: 0,
      Mathematics: 0,
      Science: 0,
    },
  );
}

function getDiversityBonus(video: VideoItem, items: VideoItem[]) {
  const category = getBrowseCategoryForVideo(video);
  const categoryCounts = getCategoryCounts(items);

  return Math.max(0, 4 - (categoryCounts[category] ?? 0)) * 0.4;
}

export function scoreVideoForExploreNow(video: VideoItem, items: VideoItem[]) {
  return (
    getEffectiveQualityScore(video) * 1.8 +
    getConfidenceScore(video) +
    getTopicStrength(video) +
    getFreshnessScore(video) +
    getTrustedSourceBonus(video) +
    getDiversityBonus(video, items)
  );
}

function isEligibleForExploreNow(video: VideoItem) {
  return (
    isGoodFeedCandidate(video) &&
    (!video.youtubeVideoId || hasPlayableYouTubeId(video)) &&
    (video.classificationConfidence ?? 0) >= MIN_NOW_CONFIDENCE &&
    getEffectiveQualityScore(video) >= 0
  );
}

function getPrimaryTopic(video: VideoItem) {
  return getPrimaryTopicForVideo(video, getBrowseCategoryForVideo(video));
}

function selectCuratedItems(
  items: VideoItem[],
  count: number,
  options?: {
    category?: BrowseCategory;
    excludedSlugs?: Set<string>;
    label: string;
    reasonFactory: (video: VideoItem) => string;
  },
) {
  const category = options?.category;
  const excludedSlugs = options?.excludedSlugs ?? new Set<string>();
  const selected: ExploreNowPick[] = [];
  const usedTopics = new Set<string>();
  const usedChannels = new Map<string, number>();
  const usedCategories = new Set<BrowseCategory>();

  const ranked = items
    .filter(isEligibleForExploreNow)
    .filter((item) => !excludedSlugs.has(item.slug))
    .filter((item) => !category || getBrowseCategoryForVideo(item) === category)
    .sort((left, right) => {
      const scoreDifference = scoreVideoForExploreNow(right, items) - scoreVideoForExploreNow(left, items);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return getPublishedTimestamp(right) - getPublishedTimestamp(left);
    });

  for (const video of ranked) {
    if (selected.length >= count) {
      break;
    }

    const videoCategory = getBrowseCategoryForVideo(video);
    const topic = getPrimaryTopic(video);
    const channelCount = usedChannels.get(video.channel) ?? 0;

    if (channelCount >= 1 && selected.length < count - 1) {
      continue;
    }

    if (category && usedTopics.has(topic) && selected.length < count - 1) {
      continue;
    }

    if (!category && selected.length < Math.min(3, count) && usedCategories.has(videoCategory)) {
      continue;
    }

    selected.push({
      video,
      label: options?.label ?? "Worth exploring",
      reason: options?.reasonFactory(video) ?? "High-quality pick with strong current relevance.",
    });
    excludedSlugs.add(video.slug);
    usedTopics.add(topic);
    usedCategories.add(videoCategory);
    usedChannels.set(video.channel, channelCount + 1);
  }

  if (selected.length < count) {
    for (const video of ranked) {
      if (selected.length >= count) {
        break;
      }

      if (selected.some((entry) => entry.video.slug === video.slug)) {
        continue;
      }

      selected.push({
        video,
        label: options?.label ?? "Worth exploring",
        reason: options?.reasonFactory(video) ?? "High-quality pick with strong current relevance.",
      });
      excludedSlugs.add(video.slug);
    }
  }

  return selected;
}

function scoreTopicCluster(cluster: ReturnType<typeof buildVideoClusters>[number], allItems: VideoItem[]) {
  const topVideos = cluster.videos.slice(0, 3);
  const averageConfidence =
    topVideos.reduce((total, video) => total + (video.classificationConfidence ?? 0), 0) /
    Math.max(1, topVideos.length);
  const averageQuality =
    topVideos.reduce((total, video) => total + getEffectiveQualityScore(video), 0) /
    Math.max(1, topVideos.length);
  const freshness = topVideos.reduce((total, video) => total + getFreshnessScore(video), 0);
  const coherence = topVideos.reduce((total, video) => total + getTopicStrength(video), 0);

  return averageQuality * 1.5 + averageConfidence * 8 + freshness + coherence + getDiversityBonus(cluster.primaryVideo, allItems);
}

function buildRecentTopicSection(items: VideoItem[], excludedSlugs: Set<string>) {
  const recentEligible = items
    .filter(isEligibleForExploreNow)
    .filter((item) => !excludedSlugs.has(item.slug))
    .filter((item) => getAgeHours(item) <= RECENT_TOPIC_WINDOW_HOURS);

  const selectedClusters = buildVideoClusters(recentEligible, 10)
    .filter((cluster) => (cluster.primaryVideo.classificationConfidence ?? 0) >= MIN_NOW_CONFIDENCE)
    .sort((left, right) => scoreTopicCluster(right, items) - scoreTopicCluster(left, items))
    .slice(0, 6);

  const usedCategories = new Set<BrowseCategory>();
  const picks: ExploreNowPick[] = [];

  for (const cluster of selectedClusters) {
    if (picks.length >= 3) {
      break;
    }

    if (usedCategories.has(cluster.browseCategory) && picks.length < 2) {
      continue;
    }

    const video = cluster.primaryVideo;

    picks.push({
      video,
      label: "Fresh topic",
      reason: `${cluster.primaryTopic} has a strong recent signal with enough depth to explore now.`,
    });
    usedCategories.add(cluster.browseCategory);
    excludedSlugs.add(video.slug);
  }

  if (picks.length < 2) {
    return null;
  }

  return {
    id: "recent-topics",
    title: "Fresh topic lanes",
    description: "Topic lanes with enough substance and relevance to open next.",
    category: "All" as const,
    items: picks,
  };
}

function getCategorySectionTitle(category: BrowseCategory) {
  return `Explore in ${category}`;
}

function getCategorySectionDescription(category: BrowseCategory) {
  switch (category) {
    case "AI & Tech":
      return "High-quality AI and technology picks with clear relevance and explanatory depth.";
    case "Physics":
      return "Physics videos with strong relevance, clean explanations, and durable value.";
    case "Mathematics":
      return "Mathematics videos with clear ideas and enough substance to open next.";
    case "Science":
      return "Science coverage that is credible, timely, and useful for topic-first exploration.";
  }
}

export function buildExploreNowSections(items: VideoItem[]) {
  const eligibleItems = items.filter(isEligibleForExploreNow);
  const excludedSlugs = new Set<string>();
  const sections: ExploreNowGroup[] = [];

  const strongIdeas = selectCuratedItems(eligibleItems, 3, {
    excludedSlugs,
    label: "Explore now",
    reasonFactory: (video) =>
      `${getPrimaryTopic(video)} is surfacing with strong quality and a clean topic fit.`,
  });

  if (strongIdeas.length > 0) {
    sections.push({
      id: "strong-ideas-now",
      title: "Worth exploring",
      description: "A compact editorial pass over timely videos with strong quality and topic fit.",
      category: "All",
      items: strongIdeas,
    });
  }

  const recentTopics = buildRecentTopicSection(eligibleItems, excludedSlugs);

  if (recentTopics) {
    sections.push(recentTopics);
  }

  const categorySections = CATEGORY_ORDER
    .map((category) => {
      const sectionItems = selectCuratedItems(eligibleItems, 2, {
        category,
        excludedSlugs,
        label: category === "AI & Tech" ? "Explore now" : "Worth exploring",
        reasonFactory: (video) => `Strong match for ${category} through ${getPrimaryTopic(video)}.`,
      });

      const score = sectionItems.reduce(
        (total, item) => total + scoreVideoForExploreNow(item.video, eligibleItems),
        0,
      );

      return {
        id: `explore-${category.toLowerCase().replace(/\s+/g, "-")}`,
        title: getCategorySectionTitle(category),
        description: getCategorySectionDescription(category),
        category,
        items: sectionItems,
        score,
      };
    })
    .filter((section) => section.items.length >= MIN_CATEGORY_SECTION_ITEMS)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map(({ score: _score, ...section }) => section);

  sections.push(...categorySections);

  return sections;
}

export function flattenExploreNowSections(sections: ExploreNowGroup[], count = 3) {
  const flattened = sections.flatMap((section) => section.items);
  const unique = new Map<string, ExploreNowPick>();

  for (const item of flattened) {
    if (!unique.has(item.video.slug)) {
      unique.set(item.video.slug, item);
    }
  }

  return [...unique.values()].slice(0, count);
}
