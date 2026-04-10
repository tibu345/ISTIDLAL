import { getBrowseCategoryForVideo, getVideoLevelLabel, type BrowseCategory, type VideoItem } from "@/lib/site-data";
import { getTopicsForVideo } from "@/lib/video-curation";

export type TopicCollection = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  browseCategory: BrowseCategory;
  topic: string;
  videoCount: number;
  starterVideo: VideoItem;
  supportingVideos: VideoItem[];
  videos: VideoItem[];
  sharedKeywords: string[];
  averageConfidence: number;
};

type TopicCollectionCandidate = {
  browseCategory: BrowseCategory;
  topic: string;
  videos: VideoItem[];
};

const MIN_COLLECTION_VIDEOS = 4;
const MAX_COLLECTION_VIDEOS = 6;
const MIN_AVERAGE_CONFIDENCE = 0.72;
const MIN_STARTER_SCORE = 24;
const MIN_GROUP_COHERENCE = 2.4;
const stopKeywords = new Set([
  "about",
  "explained",
  "introduction",
  "overview",
  "science",
  "technology",
  "video",
  "videos",
  "research",
  "study",
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getKeywordSignals(video: VideoItem) {
  return [
    ...(video.keywords ?? []),
    ...(video.tags ?? []),
    ...video.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length >= 4),
  ]
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= 4 && !stopKeywords.has(term));
}

function getSharedKeywords(videos: VideoItem[]) {
  const counts = new Map<string, number>();

  for (const video of videos) {
    const uniqueKeywords = new Set(getKeywordSignals(video));

    for (const keyword of uniqueKeywords) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .map(([keyword]) => keyword)
    .slice(0, 4);
}

function getTopicRelevance(video: VideoItem, topic: string, sharedKeywords: string[]) {
  const haystack = `${video.title} ${video.description} ${(video.tags ?? []).join(" ")} ${(video.keywords ?? []).join(" ")}`.toLowerCase();
  let score = getTopicsForVideo(video, getBrowseCategoryForVideo(video)).includes(topic) ? 8 : 0;

  for (const keyword of sharedKeywords) {
    if (haystack.includes(keyword)) {
      score += 2;
    }
  }

  if (haystack.includes(topic.toLowerCase())) {
    score += 4;
  }

  return score;
}

function getCollectionCoherence(videos: VideoItem[], topic: string, sharedKeywords: string[]) {
  const total = videos.reduce((sum, video) => sum + getTopicRelevance(video, topic, sharedKeywords), 0);
  return total / Math.max(1, videos.length);
}

function getStarterScore(video: VideoItem, topic: string, sharedKeywords: string[]) {
  const levelLabel = getVideoLevelLabel(video);
  const confidence = (video.classificationConfidence ?? 0) * 14;
  const quality = Math.max(0, video.qualityScore ?? video.curationScore ?? 0) * 0.8;
  const trust = video.trustedSource ? 4 : 0;
  const relevance = getTopicRelevance(video, topic, sharedKeywords);
  const levelBonus =
    levelLabel === "Beginner"
      ? 8
      : levelLabel === "Quick start"
        ? 6
        : levelLabel === "Guided"
          ? 4
          : levelLabel === "Deep dive"
            ? 2
            : 0;

  return confidence + quality + trust + relevance + levelBonus;
}

function getSequenceRank(video: VideoItem) {
  const levelLabel = getVideoLevelLabel(video);

  switch (levelLabel) {
    case "Beginner":
      return 0;
    case "Quick start":
      return 1;
    case "Guided":
      return 2;
    case "Deep dive":
      return 3;
    case "Advanced":
      return 4;
    default:
      return 2;
  }
}

function buildCollectionSummary(topic: string, browseCategory: BrowseCategory, starterVideo: VideoItem, sharedKeywords: string[]) {
  const keywordLine = sharedKeywords.slice(0, 2).join(" and ");

  if (keywordLine) {
    return `Start with ${starterVideo.title} and stay inside a focused ${browseCategory.toLowerCase()} lane around ${topic.toLowerCase()}, ${keywordLine}, and closely related ideas.`;
  }

  return `Start with ${starterVideo.title} and move through a focused ${browseCategory.toLowerCase()} lane built around ${topic.toLowerCase()}.`;
}

function buildTopicCollection(candidate: TopicCollectionCandidate): TopicCollection | null {
  const eligibleVideos = candidate.videos.filter(
    (video) =>
      (video.classificationConfidence ?? 0) >= 0.68 &&
      (video.qualityScore ?? video.curationScore ?? 0) >= 0,
  );

  if (eligibleVideos.length < MIN_COLLECTION_VIDEOS) {
    return null;
  }

  const averageConfidence =
    eligibleVideos.reduce((sum, video) => sum + (video.classificationConfidence ?? 0), 0) / eligibleVideos.length;

  if (averageConfidence < MIN_AVERAGE_CONFIDENCE) {
    return null;
  }

  const sharedKeywords = getSharedKeywords(eligibleVideos);
  const coherence = getCollectionCoherence(eligibleVideos, candidate.topic, sharedKeywords);

  if (coherence < MIN_GROUP_COHERENCE) {
    return null;
  }

  const starterCandidates = eligibleVideos
    .map((video) => ({
      video,
      score: getStarterScore(video, candidate.topic, sharedKeywords),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.video.title.localeCompare(right.video.title);
    });
  const starter = starterCandidates[0];

  if (!starter || starter.score < MIN_STARTER_SCORE) {
    return null;
  }

  const remainingVideos = eligibleVideos
    .filter((video) => video.slug !== starter.video.slug)
    .map((video) => ({
      video,
      relevance: getTopicRelevance(video, candidate.topic, sharedKeywords),
      sequenceRank: getSequenceRank(video),
      confidence: video.classificationConfidence ?? 0,
      quality: video.qualityScore ?? video.curationScore ?? 0,
    }))
    .sort((left, right) => {
      if (left.sequenceRank !== right.sequenceRank) {
        return left.sequenceRank - right.sequenceRank;
      }

      if (right.relevance !== left.relevance) {
        return right.relevance - left.relevance;
      }

      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }

      return right.quality - left.quality;
    })
    .slice(0, MAX_COLLECTION_VIDEOS - 1)
    .map((entry) => entry.video);

  const orderedVideos = [starter.video, ...remainingVideos];

  if (orderedVideos.length < MIN_COLLECTION_VIDEOS) {
    return null;
  }

  return {
    id: `${candidate.browseCategory}:${candidate.topic}`,
    slug: slugify(`${candidate.browseCategory}-${candidate.topic}`),
    title: candidate.topic,
    summary: buildCollectionSummary(candidate.topic, candidate.browseCategory, starter.video, sharedKeywords),
    browseCategory: candidate.browseCategory,
    topic: candidate.topic,
    videoCount: orderedVideos.length,
    starterVideo: starter.video,
    supportingVideos: orderedVideos.slice(1),
    videos: orderedVideos,
    sharedKeywords,
    averageConfidence,
  };
}

export function buildTopicCollections(videos: VideoItem[], maxCollections = 3): TopicCollection[] {
  const groups = new Map<string, TopicCollectionCandidate>();

  for (const video of videos) {
    const browseCategory = getBrowseCategoryForVideo(video);
    const topic = getTopicsForVideo(video, browseCategory)[0];

    if (!topic) {
      continue;
    }

    const key = `${browseCategory}:${topic}`;
    const existing = groups.get(key) ?? {
      browseCategory,
      topic,
      videos: [],
    };

    existing.videos.push(video);
    groups.set(key, existing);
  }

  const collections = [...groups.values()]
    .map((candidate) => buildTopicCollection(candidate))
    .filter((collection): collection is TopicCollection => Boolean(collection))
    .sort((left, right) => {
      if (right.videoCount !== left.videoCount) {
        return right.videoCount - left.videoCount;
      }

      if (right.averageConfidence !== left.averageConfidence) {
        return right.averageConfidence - left.averageConfidence;
      }

      return left.title.localeCompare(right.title);
    });

  const deduped: TopicCollection[] = [];
  const seenTopics = new Set<string>();

  for (const collection of collections) {
    const topicKey = `${collection.browseCategory}:${collection.topic}`;

    if (seenTopics.has(topicKey)) {
      continue;
    }

    deduped.push(collection);
    seenTopics.add(topicKey);

    if (deduped.length >= maxCollections) {
      break;
    }
  }

  return deduped;
}

export function getTopicCollectionBySlug(videos: VideoItem[], slug: string) {
  return buildTopicCollections(videos, 24).find((collection) => collection.slug === slug) ?? null;
}
