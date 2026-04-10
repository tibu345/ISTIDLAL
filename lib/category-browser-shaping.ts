import {
  type BrowseCategory,
  type VideoItem,
  browseCategoryDescriptions,
  filterVideosByBrowseCategory,
  getVideoLevelLabel,
} from "@/lib/site-data";
import {
  getRelatedVideosForTopic,
  getTopicCoverage,
  getTopicDefinitions,
} from "@/lib/video-curation";
import { buildLearningPaths, getLearningPathForTopic } from "@/lib/learning-paths";

export const browseCategories: BrowseCategory[] = ["AI & Tech", "Physics", "Mathematics", "Science"];

function getUniqueVideoCount(videos: VideoItem[]) {
  return new Set(videos.map((video) => video.id)).size;
}

function getStarterVideos(videos: VideoItem[], topic: string) {
  return [...videos]
    .sort((left, right) => {
      const leftScore =
        (getVideoLevelLabel(left) === "Beginner" ? 5 : 0) +
        (getVideoLevelLabel(left) === "Quick start" ? 4 : 0) +
        (getVideoLevelLabel(left) === "Guided" ? 2 : 0) +
        (left.trustedSource ? 2 : 0) +
        (left.classificationConfidence ?? 0) * 5 +
        Math.max(0, left.qualityScore ?? left.curationScore ?? 0) * 0.35 +
        (`${left.title} ${left.description}`.toLowerCase().includes(topic.toLowerCase()) ? 3 : 0) -
        (left.durationSeconds ?? 0) / 1200;
      const rightScore =
        (getVideoLevelLabel(right) === "Beginner" ? 5 : 0) +
        (getVideoLevelLabel(right) === "Quick start" ? 4 : 0) +
        (getVideoLevelLabel(right) === "Guided" ? 2 : 0) +
        (right.trustedSource ? 2 : 0) +
        (right.classificationConfidence ?? 0) * 5 +
        Math.max(0, right.qualityScore ?? right.curationScore ?? 0) * 0.35 +
        (`${right.title} ${right.description}`.toLowerCase().includes(topic.toLowerCase()) ? 3 : 0) -
        (right.durationSeconds ?? 0) / 1200;
      return rightScore - leftScore;
    })
    .slice(0, 2);
}

function getContinueLearningVideos(
  selectedTopicVideos: VideoItem[],
  topicRelatedVideos: VideoItem[],
  starterVideos: VideoItem[],
) {
  const starterIds = new Set(starterVideos.map((video) => video.id));
  const deduped = [...selectedTopicVideos, ...topicRelatedVideos].filter(
    (video, index, items) =>
      !starterIds.has(video.id) && items.findIndex((entry) => entry.id === video.id) === index,
  );

  return deduped.slice(0, 6);
}

export function getAdjacentCategories(category: BrowseCategory) {
  const map: Record<BrowseCategory, BrowseCategory[]> = {
    "AI & Tech": ["Mathematics", "Physics"],
    Physics: ["Mathematics", "Science"],
    Mathematics: ["Physics", "AI & Tech"],
    Science: ["Physics", "AI & Tech"],
  };

  return map[category];
}

export function buildCategoriesBrowserState(
  videos: VideoItem[],
  selectedCategory: BrowseCategory | "All",
  searchTopic: string | null,
) {
  const categoryOverview = browseCategories.map((category) => {
    const categoryVideos = filterVideosByBrowseCategory(videos, category);
    const topicCoverage = getTopicCoverage(categoryVideos, category);
    const surfacedVideos = topicCoverage
      .filter((topic) => topic.coverageState !== "empty")
      .flatMap((topic) => topic.videos);

    return {
      category,
      categoryVideos,
      topicCoverage,
      surfacedVideoCount: getUniqueVideoCount(surfacedVideos),
      description: browseCategoryDescriptions[category],
    };
  });

  const categoryOverviewByCategory = Object.fromEntries(
    categoryOverview.map((entry) => [entry.category, entry]),
  ) as Record<BrowseCategory, (typeof categoryOverview)[number]>;

  if (selectedCategory === "All") {
    return {
      categoryOverview,
      categoryOverviewByCategory,
      selectedCategoryVideos: [] as VideoItem[],
      selectedTopicCoverage: [],
      activeTopicCoverage: [],
      lightTopicCoverage: [],
      taxonomyLabels: [] as string[],
      selectedTopic: "All",
      topicFilters: [],
      selectedTopicData: null,
      fallbackTopicSuggestions: [],
      relatedVideos: [] as VideoItem[],
      selectedCategoryDescription: null as string | null,
      selectedTopicStarterVideos: [] as VideoItem[],
      selectedTopicContinueVideos: [] as VideoItem[],
      selectedTopicIsSparse: false,
      selectedTopicSummary: null as null | {
        label: string;
        description: string;
        coverageState: string;
        statusLabel: string;
      },
      selectedTopicLearningPath: null,
      categoryLearningPaths: [] as ReturnType<typeof buildLearningPaths>,
      adjacentCategories: [] as BrowseCategory[],
    };
  }

  const selectedCategoryState = categoryOverviewByCategory[selectedCategory];
  const selectedCategoryVideos = selectedCategoryState.categoryVideos;
  const selectedTopicCoverage = selectedCategoryState.topicCoverage;
  const activeTopicCoverage = selectedTopicCoverage.filter((topic) => topic.coverageState === "active");
  const lightTopicCoverage = selectedTopicCoverage.filter((topic) => topic.coverageState === "light");
  const taxonomyLabels = getTopicDefinitions(selectedCategory).map((topic) => topic.label);
  const selectedTopic =
    searchTopic && taxonomyLabels.includes(searchTopic) ? searchTopic : "All";
  const topicFilters = [
    { label: "All" as const },
    ...selectedTopicCoverage.map((topic) => ({
      label: topic.label,
      count: topic.videoCount,
      coverageState: topic.coverageState,
      statusLabel: topic.statusLabel,
    })),
  ];
  const selectedTopicData =
    selectedTopic === "All"
      ? null
      : selectedTopicCoverage.find((topic) => topic.label === selectedTopic) ?? null;
  const fallbackTopicSuggestions = activeTopicCoverage.slice(0, 3).filter((topic) => topic.label !== selectedTopic);
  const relatedVideos =
    selectedTopic === "All"
      ? []
      : getRelatedVideosForTopic(selectedCategoryVideos, selectedCategory, selectedTopic, 4);
  const selectedTopicStarterVideos =
    selectedTopicData && selectedTopicData.videoCount > 0
      ? getStarterVideos(selectedTopicData.videos, selectedTopicData.label)
      : [];
  const selectedTopicContinueVideos =
    selectedTopicData && selectedTopicData.videoCount > 0
      ? getContinueLearningVideos(selectedTopicData.videos, relatedVideos, selectedTopicStarterVideos)
      : [];
  const selectedTopicLearningPath =
    selectedTopic !== "All" ? getLearningPathForTopic(selectedCategoryVideos, selectedCategory, selectedTopic) : null;
  const categoryLearningPaths = buildLearningPaths(selectedCategoryVideos, {
    category: selectedCategory,
    maxPaths: 3,
  });
  const selectedTopicIsSparse =
    selectedTopic !== "All" &&
    (!selectedTopicData ||
      selectedTopicData.coverageState !== "active" ||
      (selectedTopicLearningPath ? selectedTopicLearningPath.steps.length < 4 : selectedTopicStarterVideos.length === 0));

  return {
    categoryOverview,
    categoryOverviewByCategory,
    selectedCategoryVideos,
    selectedTopicCoverage,
    activeTopicCoverage,
    lightTopicCoverage,
    taxonomyLabels,
    selectedTopic,
    topicFilters,
    selectedTopicData,
    fallbackTopicSuggestions,
    relatedVideos,
    selectedCategoryDescription: selectedCategoryState.description,
    selectedTopicStarterVideos:
      selectedTopicLearningPath?.steps.slice(0, 1).map((step) => step.video) ?? selectedTopicStarterVideos,
    selectedTopicContinueVideos:
      selectedTopicLearningPath?.steps.slice(1, 7).map((step) => step.video) ?? selectedTopicContinueVideos,
    selectedTopicIsSparse,
    selectedTopicSummary: selectedTopicData
      ? {
          label: selectedTopicData.label,
          description: selectedTopicData.description,
          coverageState: selectedTopicData.coverageState,
          statusLabel: selectedTopicData.statusLabel,
        }
      : null,
    selectedTopicLearningPath,
    categoryLearningPaths,
    adjacentCategories: getAdjacentCategories(selectedCategory),
  };
}
