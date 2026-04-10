import { getBrowseCategoryForVideo, getVideoLevelLabel, type BrowseCategory, type VideoItem } from "@/lib/site-data";
import { parseSearchIntent } from "@/lib/search-intent";
import { getTopicDefinitions, getTopicMatchesForVideo, getTopicsForVideo } from "@/lib/video-curation";

export type LearningPathLevel = "beginner" | "intermediate";
export type LearningPathStepLabel = "intro" | "concept" | "example" | "advanced";

export type LearningPathStep = {
  video: VideoItem;
  index: number;
  label?: LearningPathStepLabel;
};

export type LearningPath = {
  id: string;
  title: string;
  category: BrowseCategory;
  topic: string;
  level?: LearningPathLevel;
  steps: LearningPathStep[];
};

type LearningPathOptions = {
  category?: BrowseCategory | null;
  topic?: string | null;
  maxPaths?: number;
};

type CandidateVideo = {
  video: VideoItem;
  topicMatchScore: number;
  qualityScore: number;
  confidenceScore: number;
  progressionStage: number;
  progressionScore: number;
  beginnerScore: number;
  depthScore: number;
  label?: LearningPathStepLabel;
};

type TopicCluster = {
  category: BrowseCategory;
  topic: string;
  videos: VideoItem[];
};

const MIN_PATH_STEPS = 4;
const MAX_PATH_STEPS = 8;
const MIN_AVERAGE_CONFIDENCE = 0.72;
const MIN_AVERAGE_QUALITY = 1;
const MIN_COHERENCE = 4.5;
const MIN_TOPIC_MATCH = 3;

const introPatterns = [/\b(intro|introduction|overview|getting started|start here|fundamentals|basics|explained)\b/i];
const conceptPatterns = [/\b(concept|principle|theory|framework|intuition|understanding|what is|how it works)\b/i];
const examplePatterns = [/\b(example|examples|case study|walkthrough|demo|worked example|application|breakdown)\b/i];
const advancedPatterns = [/\b(advanced|deep dive|deep-dive|lecture|seminar|proof|formal|research|masterclass|full course)\b/i];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getVideoText(video: VideoItem) {
  return `${video.title} ${video.description} ${(video.tags ?? []).join(" ")} ${(video.keywords ?? []).join(" ")}`.trim();
}

function getMeaningfulTerms(video: VideoItem) {
  return new Set(
    getVideoText(video)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length >= 4)
      .filter(
        (term) =>
          ![
            "about",
            "advanced",
            "basics",
            "beginner",
            "concept",
            "example",
            "explained",
            "fundamentals",
            "introduction",
            "lecture",
            "overview",
            "theory",
            "video",
          ].includes(term),
      ),
  );
}

function getTopicMatchScore(video: VideoItem, category: BrowseCategory, topic: string) {
  const exactMatch = getTopicMatchesForVideo(video, category).find((entry) => entry.label === topic)?.score ?? 0;
  const fallbackMatch = getTopicsForVideo(video, category).includes(topic) ? 2 : 0;
  const haystack = getVideoText(video).toLowerCase();
  const literalTopicMatch = haystack.includes(topic.toLowerCase()) ? 2 : 0;

  return exactMatch + fallbackMatch + literalTopicMatch;
}

function getVideoQuality(video: VideoItem) {
  return Math.max(0, video.qualityScore ?? video.curationScore ?? 0);
}

function getBeginnerAndDepthScores(video: VideoItem) {
  const text = getVideoText(video);
  const intent = parseSearchIntent(text);
  const levelLabel = getVideoLevelLabel(video);
  const beginnerPatternHits = introPatterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
  const conceptPatternHits = conceptPatterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
  const examplePatternHits = examplePatterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
  const advancedPatternHits = advancedPatterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);

  const beginnerScore =
    beginnerPatternHits * 4 +
    conceptPatternHits * 2 +
    (intent.difficulty === "beginner" ? 4 : 0) +
    (levelLabel === "Beginner" ? 4 : 0) +
    (levelLabel === "Quick start" ? 3 : 0);
  const depthScore =
    advancedPatternHits * 4 +
    examplePatternHits +
    (intent.difficulty === "advanced" ? 4 : 0) +
    (levelLabel === "Advanced" ? 5 : 0) +
    (levelLabel === "Deep dive" ? 3 : 0);

  return {
    beginnerScore,
    depthScore,
    conceptPatternHits,
    examplePatternHits,
  };
}

function getStepPlacement(video: VideoItem) {
  const text = getVideoText(video);
  const { beginnerScore, depthScore, conceptPatternHits, examplePatternHits } = getBeginnerAndDepthScores(video);

  if (introPatterns.some((pattern) => pattern.test(text)) || beginnerScore >= 7) {
    return { stage: 0, label: "intro" as const };
  }

  if (conceptPatternHits > 0 || beginnerScore >= 4) {
    return { stage: 1, label: "concept" as const };
  }

  if (examplePatternHits > 0) {
    return { stage: 2, label: "example" as const };
  }

  if (depthScore >= 7) {
    return { stage: 4, label: "advanced" as const };
  }

  return { stage: 3, label: undefined };
}

function getProgressionScore(video: VideoItem, topicMatchScore: number) {
  const qualityScore = getVideoQuality(video);
  const confidenceScore = video.classificationConfidence ?? 0;
  const { beginnerScore, depthScore } = getBeginnerAndDepthScores(video);
  const placement = getStepPlacement(video);

  return {
    qualityScore,
    confidenceScore,
    beginnerScore,
    depthScore,
    progressionStage: placement.stage,
    label: placement.label,
    progressionScore:
      topicMatchScore * 2.5 +
      qualityScore * 0.8 +
      confidenceScore * 10 +
      beginnerScore * 0.6 +
      depthScore * 0.4,
  };
}

function getCoherenceScore(videos: CandidateVideo[], topic: string) {
  const topicTokenSet = new Set(
    topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length >= 3),
  );
  const total = videos.reduce((sum, entry) => {
    const category = getBrowseCategoryForVideo(entry.video);
    const topicOverlap = getTopicsForVideo(entry.video, category).includes(topic) ? 2 : 0;
    const sharedTopicTerms = [...getMeaningfulTerms(entry.video)].reduce(
      (count, term) => count + (topicTokenSet.has(term) ? 1 : 0),
      0,
    );

    return sum + entry.topicMatchScore + topicOverlap + sharedTopicTerms;
  }, 0);

  return total / Math.max(1, videos.length);
}

function getTopicClusters(videos: VideoItem[], options?: LearningPathOptions) {
  const clusters: TopicCluster[] = [];
  const allowedCategories = options?.category ? [options.category] : null;

  for (const category of allowedCategories ?? (["AI & Tech", "Physics", "Mathematics", "Science"] as BrowseCategory[])) {
    for (const topic of getTopicDefinitions(category)) {
      if (options?.topic && options.topic !== topic.label) {
        continue;
      }

      const topicVideos = videos.filter((video) => {
        if (getBrowseCategoryForVideo(video) !== category) {
          return false;
        }

        return getTopicMatchScore(video, category, topic.label) >= MIN_TOPIC_MATCH;
      });

      if (topicVideos.length > 0) {
        clusters.push({
          category,
          topic: topic.label,
          videos: topicVideos,
        });
      }
    }
  }

  return clusters;
}

function buildLearningPathFromCluster(cluster: TopicCluster): LearningPath | null {
  const candidates = cluster.videos
    .map((video) => {
      const topicMatchScore = getTopicMatchScore(video, cluster.category, cluster.topic);
      const scoring = getProgressionScore(video, topicMatchScore);

      return {
        video,
        topicMatchScore,
        qualityScore: scoring.qualityScore,
        confidenceScore: scoring.confidenceScore,
        progressionStage: scoring.progressionStage,
        progressionScore: scoring.progressionScore,
        beginnerScore: scoring.beginnerScore,
        depthScore: scoring.depthScore,
        label: scoring.label,
      } satisfies CandidateVideo;
    })
    .filter(
      (entry) =>
        entry.topicMatchScore >= MIN_TOPIC_MATCH &&
        entry.confidenceScore >= 0.68 &&
        entry.qualityScore >= 0,
    );

  if (candidates.length < MIN_PATH_STEPS) {
    return null;
  }

  const averageConfidence =
    candidates.reduce((sum, entry) => sum + entry.confidenceScore, 0) / Math.max(1, candidates.length);
  const averageQuality =
    candidates.reduce((sum, entry) => sum + entry.qualityScore, 0) / Math.max(1, candidates.length);

  if (averageConfidence < MIN_AVERAGE_CONFIDENCE || averageQuality < MIN_AVERAGE_QUALITY) {
    return null;
  }

  const coherence = getCoherenceScore(candidates, cluster.topic);

  if (coherence < MIN_COHERENCE) {
    return null;
  }

  const ordered = candidates
    .sort((left, right) => {
      if (left.progressionStage !== right.progressionStage) {
        return left.progressionStage - right.progressionStage;
      }

      if (right.topicMatchScore !== left.topicMatchScore) {
        return right.topicMatchScore - left.topicMatchScore;
      }

      if (right.progressionScore !== left.progressionScore) {
        return right.progressionScore - left.progressionScore;
      }

      if (right.confidenceScore !== left.confidenceScore) {
        return right.confidenceScore - left.confidenceScore;
      }

      return left.video.title.localeCompare(right.video.title);
    })
    .slice(0, MAX_PATH_STEPS);

  if (ordered.length < MIN_PATH_STEPS) {
    return null;
  }

  const pathSteps = ordered.map((entry, index) => ({
    video: entry.video,
    index,
    label: entry.label,
  }));
  const beginnerWeightedCount = ordered.filter((entry) => entry.progressionStage <= 1).length;
  const level: LearningPathLevel | undefined =
    beginnerWeightedCount >= Math.ceil(ordered.length / 2) ? "beginner" : "intermediate";

  return {
    id: `${cluster.category}:${cluster.topic}:path`,
    title: `${cluster.topic} learning path`,
    category: cluster.category,
    topic: cluster.topic,
    level,
    steps: pathSteps,
  };
}

export function buildLearningPaths(videos: VideoItem[], options?: LearningPathOptions): LearningPath[] {
  const paths = getTopicClusters(videos, options)
    .map((cluster) => buildLearningPathFromCluster(cluster))
    .filter((path): path is LearningPath => Boolean(path))
    .sort((left, right) => {
      if (left.category !== right.category) {
        return left.category.localeCompare(right.category);
      }

      if (left.topic !== right.topic) {
        return left.topic.localeCompare(right.topic);
      }

      if (right.steps.length !== left.steps.length) {
        return right.steps.length - left.steps.length;
      }

      return left.title.localeCompare(right.title);
    });

  return paths.slice(0, options?.maxPaths ?? 12);
}

export function getLearningPathById(videos: VideoItem[], id: string) {
  return buildLearningPaths(videos, { maxPaths: 24 }).find((path) => path.id === id) ?? null;
}

export function getLearningPathForTopic(
  videos: VideoItem[],
  category: BrowseCategory,
  topic: string,
) {
  return buildLearningPaths(videos, { category, topic, maxPaths: 1 })[0] ?? null;
}

export function getLearningPathForVideo(videos: VideoItem[], slug: string) {
  const allPaths = buildLearningPaths(videos, { maxPaths: 24 });
  const matchingPaths = allPaths.filter((path) => path.steps.some((step) => step.video.slug === slug));

  if (matchingPaths.length === 0) {
    return null;
  }

  return matchingPaths.sort((left, right) => {
    if (right.steps.length !== left.steps.length) {
      return right.steps.length - left.steps.length;
    }

    return left.title.localeCompare(right.title);
  })[0];
}

export function getExampleLearningPaths(videos: VideoItem[], maxPaths = 3) {
  return buildLearningPaths(videos, { maxPaths }).map((path) => ({
    ...path,
    slug: slugify(`${path.category}-${path.topic}-learning-path`),
  }));
}

export function getLearningPathProgress(path: LearningPath, currentVideoSlug: string) {
  const currentIndex = path.steps.findIndex((step) => step.video.slug === currentVideoSlug);

  if (currentIndex === -1) {
    return null;
  }

  return {
    currentIndex,
    currentStep: path.steps[currentIndex],
    nextStep: path.steps[currentIndex + 1] ?? null,
    isComplete: currentIndex >= path.steps.length - 1,
  };
}
