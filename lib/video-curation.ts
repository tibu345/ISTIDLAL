import { getBrowseCategoryForVideo, type BrowseCategory, type VideoItem } from "@/lib/site-data";

export type TopicDefinition = {
  label: string;
  description: string;
  patterns: RegExp[];
};

export type TopicMatch = {
  label: string;
  score: number;
};

export type TopicGroup = {
  topic: TopicDefinition;
  videos: VideoItem[];
  totalScore: number;
};

export type TopicCoverageState = "active" | "light" | "empty";

export type TopicCoverage = {
  label: string;
  description: string;
  videoCount: number;
  totalScore: number;
  coverageState: TopicCoverageState;
  isActive: boolean;
  statusLabel: string;
  videos: VideoItem[];
};

export type VideoCluster = {
  id: string;
  label: string;
  browseCategory: BrowseCategory;
  primaryTopic: string;
  primaryVideo: VideoItem;
  supportingVideos: VideoItem[];
  videos: VideoItem[];
  score: number;
};

type InsightSelectionOptions = {
  count: number;
  excludedSlugs?: string[];
};

type SelectionOptions = {
  count: number;
  excludedSlugs?: string[];
  preferRecency?: boolean;
  surface?: string;
  maxPerChannel?: number;
  maxPerCluster?: number;
};

export type HomepageSelections = {
  featured: VideoItem | null;
  latest: VideoItem[];
  trending: VideoItem[];
};

const EXPOSURE_WINDOW_MS = 6 * 60 * 60 * 1000;
const EXPOSURE_RECENT_MS = 90 * 60 * 1000;
const ROTATION_WINDOW_MS = 12 * 60 * 60 * 1000;

const recentExposureBySlug = new Map<string, number[]>();
const recentSurfaceExposureBySlug = new Map<string, number[]>();

const titleSignals: Record<BrowseCategory, RegExp[]> = {
  "AI & Tech": [
    /\b(ai|artificial intelligence|llm|gpt|model|neural|robotics|software|chip|semiconductor|deepmind|openai|anthropic|vision model|autonomous)\b/i,
  ],
  Physics: [
    /\b(physics|quantum|space|cosmos|mars|rocket|energy|material|particle|superconduct|relativity|gravity|telescope|astrophysics|orbit|thermo|entropy|engine)\b/i,
  ],
  Mathematics: [
    /\b(math|mathematics|proof|algebra|geometry|number theory|calculus|riemann|probability|theorem|fractal|equation|topology)\b/i,
  ],
  Science: [
    /\b(science|biology|biological|medicine|medical|chemistry|chemical|genetics|genome|vaccine|research|health|disease|clinical|trial|patient|brain|neuro|climate|ecology|cell|molecule|drug|immune|virology|protein|bacteria|virus|lab)\b/i,
  ],
};

const categoryFallbackSignals: Record<BrowseCategory, RegExp[]> = {
  "AI & Tech": [/\b(research lab|startup|model|system|robot|compute|gpu|platform)\b/i],
  Physics: [/\b(experiment|particle|space|engine|launch|force|energy|matter)\b/i],
  Mathematics: [/\b(problem|proof|equation|curve|number|graph|shape|symmetry)\b/i],
  Science: [/\b(study|scientists?|lab|experiment|biology|medical|brain|health|disease|molecule|chemical|climate|ocean)\b/i],
};

const shortTitlePatterns = [/#shorts?\b/i, /\bshorts?\b/i, /\bvertical\b/i, /\b60\s?sec(onds?)?\b/i];

const lowFitTitlePatterns = [
  /\bsubscribe\b/i,
  /\bgiveaway\b/i,
  /\bpodcast clips?\b/i,
  /\breaction\b/i,
  /\bhighlights?\b/i,
  /\bclip\b/i,
];

const weakDescriptionPatterns = [/follow.*for more/i, /link in bio/i, /watch full/i];

const topicTaxonomy: Record<BrowseCategory, TopicDefinition[]> = {
  "AI & Tech": [
    {
      label: "LLMs",
      description: "Language models, model evaluation, prompting, and generative AI systems.",
      patterns: [/\b(llm|gpt|language model|transformer|prompt|agentic|generative ai|chatbot)\b/i],
    },
    {
      label: "Robotics",
      description: "Robots, automation, embodied systems, and machine control.",
      patterns: [/\b(robot|robotics|automation|autonomous|manipulation|drone|humanoid)\b/i],
    },
    {
      label: "Computer Vision",
      description: "Vision models, image understanding, perception, and multimodal systems.",
      patterns: [/\b(computer vision|vision model|image model|detection|segmentation|multimodal|perception)\b/i],
    },
    {
      label: "Startups",
      description: "Product strategy, venture-backed labs, company moves, and platform bets.",
      patterns: [/\b(startup|founder|funding|company|product|launch|market|venture)\b/i],
    },
    {
      label: "Semiconductors",
      description: "Chips, compute infrastructure, GPUs, fabs, and silicon supply chains.",
      patterns: [/\b(chip|gpu|semiconductor|silicon|fab|foundry|wafer|compute|nvidia)\b/i],
    },
  ],
  Physics: [
    {
      label: "Quantum",
      description: "Quantum theory, particles, materials, superconductivity, and information.",
      patterns: [/\b(quantum|particle|superconduct|qubit|entangl|materials?|quantized)\b/i],
    },
    {
      label: "Relativity",
      description: "Spacetime, gravity, black holes, and relativistic frameworks.",
      patterns: [/\b(relativity|spacetime|gravity|black hole|gravitational|einstein)\b/i],
    },
    {
      label: "Astrophysics",
      description: "Cosmos, stars, planets, observatories, and large-scale space science.",
      patterns: [/\b(space|cosmos|astrophysics|planet|mars|star|galaxy|telescope|orbit|universe)\b/i],
    },
    {
      label: "Thermodynamics",
      description: "Heat, temperature, energy transfer, and physical state changes.",
      patterns: [/\b(thermo|temperature|entropy|heat|energy transfer|phase change|thermal)\b/i],
    },
    {
      label: "Mechanics",
      description: "Motion, forces, propulsion, launch systems, and physical dynamics.",
      patterns: [/\b(mechanics|motion|force|launch|rocket|engine|propulsion|trajectory|rotation)\b/i],
    },
  ],
  Mathematics: [
    {
      label: "Number Theory",
      description: "Primes, integers, zeta functions, and deep arithmetic structures.",
      patterns: [/\b(number theory|prime|integer|riemann|zeta|modular|diophantine)\b/i],
    },
    {
      label: "Geometry",
      description: "Shapes, topology, manifolds, symmetry, and spatial reasoning.",
      patterns: [/\b(geometry|topology|shape|manifold|symmetry|geometric)\b/i],
    },
    {
      label: "Calculus",
      description: "Change, derivatives, integrals, and continuous systems.",
      patterns: [/\b(calculus|derivative|integral|differential|gradient|optimization)\b/i],
    },
    {
      label: "Probability",
      description: "Statistics, randomness, uncertainty, and probabilistic modeling.",
      patterns: [/\b(probability|statistics|stochastic|random|bayesian|distribution)\b/i],
    },
    {
      label: "Logic",
      description: "Proofs, formal reasoning, theorem structures, and symbolic systems.",
      patterns: [/\b(logic|proof|theorem|formal|set theory|computability)\b/i],
    },
  ],
  Science: [
    {
      label: "Biology",
      description: "Cells, genetics, evolution, ecosystems, and living systems.",
      patterns: [/\b(biology|biological|cell|cells|genetic|genome|crispr|dna|protein|evolution|species|ecology|bacteria|virus|microbiome)\b/i],
    },
    {
      label: "Chemistry",
      description: "Molecules, reactions, compounds, and chemical processes.",
      patterns: [/\b(chemistry|chemical|molecule|molecular|reaction|compound|catalyst|polymer|synthesis|electrochem|solvent|ion)\b/i],
    },
    {
      label: "Medicine",
      description: "Clinical trials, vaccines, diseases, treatment, and human health.",
      patterns: [/\b(medicine|medical|vaccine|trial|disease|clinical|health|patient|therapy|treatment|drug|infection|immune)\b/i],
    },
    {
      label: "Neuroscience",
      description: "Brain science, cognition, neural systems, and consciousness research.",
      patterns: [/\b(neuroscience|brain|cortex|neuron|cognitive|memory|consciousness|synapse|neurolog|neural circuit)\b/i],
    },
    {
      label: "Climate",
      description: "Climate systems, carbon, oceans, warming, and environmental change.",
      patterns: [/\b(climate|carbon|warming|environment|ocean|emissions|atmosphere|weather|biodiversity|ecosystem)\b/i],
    },
  ],
};

function hasPatternMatch(input: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(input));
}

function countPatternMatches(input: string, patterns: RegExp[]) {
  return patterns.reduce((total, pattern) => total + (pattern.test(input) ? 1 : 0), 0);
}

function extractMeaningfulTerms(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 3)
    .filter(
      (term) =>
        ![
          "with",
          "from",
          "this",
          "that",
          "into",
          "their",
          "about",
          "inside",
          "through",
          "systems",
          "current",
          "strong",
        ].includes(term),
    );
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pruneExposureStore(now = Date.now()) {
  for (const [key, timestamps] of recentExposureBySlug) {
    const next = timestamps.filter((timestamp) => now - timestamp < EXPOSURE_WINDOW_MS);

    if (next.length === 0) recentExposureBySlug.delete(key);
    else recentExposureBySlug.set(key, next);
  }

  for (const [key, timestamps] of recentSurfaceExposureBySlug) {
    const next = timestamps.filter((timestamp) => now - timestamp < EXPOSURE_WINDOW_MS);

    if (next.length === 0) recentSurfaceExposureBySlug.delete(key);
    else recentSurfaceExposureBySlug.set(key, next);
  }
}

function getRotationJitter(slug: string, surface = "global") {
  const window = Math.floor(Date.now() / ROTATION_WINDOW_MS);
  return (hashString(`${surface}:${window}:${slug}`) % 1000) / 1000;
}

function recordExposure(surface: string, videos: VideoItem[]) {
  const now = Date.now();
  pruneExposureStore(now);

  for (const video of videos) {
    const globalKey = video.slug;
    const surfaceKey = `${surface}:${video.slug}`;
    recentExposureBySlug.set(globalKey, [...(recentExposureBySlug.get(globalKey) ?? []), now]);
    recentSurfaceExposureBySlug.set(surfaceKey, [
      ...(recentSurfaceExposureBySlug.get(surfaceKey) ?? []),
      now,
    ]);
  }
}

function getExposurePenalty(video: VideoItem, surface = "global") {
  const now = Date.now();
  const globalHits = (recentExposureBySlug.get(video.slug) ?? []).filter(
    (timestamp) => now - timestamp < EXPOSURE_WINDOW_MS,
  );
  const surfaceHits = (recentSurfaceExposureBySlug.get(`${surface}:${video.slug}`) ?? []).filter(
    (timestamp) => now - timestamp < EXPOSURE_WINDOW_MS,
  );
  const recentGlobalHit = globalHits.some((timestamp) => now - timestamp < EXPOSURE_RECENT_MS);

  return globalHits.length * 1.5 + surfaceHits.length * 2 + (recentGlobalHit ? 2 : 0);
}

function getPublishedTimestamp(video: VideoItem) {
  return video.publishedAtISO ? new Date(video.publishedAtISO).getTime() : 0;
}

function getCategoryCounts(items: VideoItem[]) {
  return items.reduce<Record<BrowseCategory, number>>((accumulator, item) => {
    const category = getBrowseCategoryForVideo(item);
    accumulator[category] = (accumulator[category] ?? 0) + 1;
    return accumulator;
  }, {
    "AI & Tech": 0,
    Physics: 0,
    Mathematics: 0,
    Science: 0,
  });
}

function getTopicDiversityScore(video: VideoItem, items: VideoItem[]) {
  const category = getBrowseCategoryForVideo(video);
  const videoTopics = getTopicsForVideo(video, category);

  if (videoTopics.length === 0) {
    return 0;
  }

  const topicCounts = items.reduce<Record<string, number>>((accumulator, item) => {
    getTopicsForVideo(item, getBrowseCategoryForVideo(item)).forEach((topic) => {
      accumulator[topic] = (accumulator[topic] ?? 0) + 1;
    });

    return accumulator;
  }, {});

  return videoTopics.reduce((total, topic) => total + Math.max(0, 4 - (topicCounts[topic] ?? 0)), 0);
}

function scoreFeaturedCandidate(video: VideoItem, items: VideoItem[]) {
  const baseScore = video.curationScore ?? scoreVideoForCuration(video);
  const categoryCounts = getCategoryCounts(items);
  const category = getBrowseCategoryForVideo(video);
  const categoryScarcityBonus = Math.max(0, 4 - (categoryCounts[category] ?? 0)) * 0.45;
  const topicDiversityBonus = getTopicDiversityScore(video, items) * 0.35;
  const recencyBonus = Math.min(4.5, getRecencyBonus(video));
  const descriptionBonus = Math.min(3, Math.floor(video.description.length / 70));
  const durationBonus =
    video.durationSeconds && video.durationSeconds >= 10 * 60
      ? 2.5
      : video.durationSeconds && video.durationSeconds >= 6 * 60
        ? 1.25
        : 0;
  const playbackBonus = hasPlayableYouTubeId(video) ? 2 : 0;
  const jitter = getRotationJitter(video.slug, "homepage-featured") * 0.8;

  return (
    baseScore +
    recencyBonus +
    categoryScarcityBonus +
    topicDiversityBonus +
    descriptionBonus +
    durationBonus +
    playbackBonus +
    jitter
  );
}

export function isLikelyVerticalThumbnail(video: Pick<VideoItem, "thumbnailWidth" | "thumbnailHeight">) {
  if (!video.thumbnailWidth || !video.thumbnailHeight) {
    return false;
  }

  return video.thumbnailHeight > video.thumbnailWidth;
}

export function isLikelyShortForm(
  video: Pick<VideoItem, "title" | "durationSeconds" | "thumbnailWidth" | "thumbnailHeight" | "isShortForm">,
) {
  if (video.isShortForm) {
    return true;
  }

  if (video.durationSeconds && video.durationSeconds <= 90) {
    return true;
  }

  if (hasPatternMatch(video.title, shortTitlePatterns)) {
    return true;
  }

  return isLikelyVerticalThumbnail(video);
}

export function hasPlayableYouTubeId(video: Pick<VideoItem, "youtubeVideoId">) {
  return Boolean(video.youtubeVideoId && /^[A-Za-z0-9_-]{11}$/.test(video.youtubeVideoId));
}

export function getTopicDefinitions(category: BrowseCategory) {
  return topicTaxonomy[category];
}

export function getTopicScoresForVideo(
  video: VideoItem,
  category = getBrowseCategoryForVideo(video),
): TopicMatch[] {
  const title = video.title;
  const description = video.description;
  const channel = video.channel;

  return topicTaxonomy[category]
    .map((topic) => {
      const titleMatches = countPatternMatches(title, topic.patterns);
      const descriptionMatches = countPatternMatches(description, topic.patterns);
      const channelMatches = countPatternMatches(channel, topic.patterns);

      return {
        label: topic.label,
        score: titleMatches * 5 + descriptionMatches * 3 + channelMatches * 4,
      };
    })
    .sort((left, right) => right.score - left.score);
}

function getWeakTopicFallbackScore(
  video: VideoItem,
  topic: TopicDefinition,
  category = getBrowseCategoryForVideo(video),
) {
  const haystack = `${video.title} ${video.description} ${video.channel}`.toLowerCase();
  const topicTerms = extractMeaningfulTerms(`${topic.label} ${topic.description}`);
  const overlapCount = topicTerms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
  const categoryFallbackCount = countPatternMatches(haystack, categoryFallbackSignals[category]);
  return overlapCount + Math.min(1, categoryFallbackCount);
}

export function getTopicMatchesForVideo(
  video: VideoItem,
  category = getBrowseCategoryForVideo(video),
): TopicMatch[] {
  return getTopicScoresForVideo(video, category)
    .filter((topic) => topic.score > 0)
    .slice(0, 2);
}

export function getPrimaryTopicForVideo(
  video: VideoItem,
  category = getBrowseCategoryForVideo(video),
) {
  const strongMatch = getTopicMatchesForVideo(video, category)[0];

  if (strongMatch) {
    return strongMatch.label;
  }

  const weakMatch = topicTaxonomy[category]
    .map((topic) => ({
      label: topic.label,
      score: getWeakTopicFallbackScore(video, topic, category),
    }))
    .sort((left, right) => right.score - left.score)[0];

  return weakMatch?.label ?? topicTaxonomy[category][0].label;
}

export function getTopicsForVideo(video: VideoItem, category = getBrowseCategoryForVideo(video)) {
  const strongMatches = getTopicMatchesForVideo(video, category);

  if (strongMatches.length > 0) {
    return strongMatches.map((topic) => topic.label);
  }

  return [getPrimaryTopicForVideo(video, category)];
}

export function groupVideosByTopic(items: VideoItem[], category: BrowseCategory) {
  return getTopicDefinitions(category)
    .map((topic) => {
      const scoredVideos = items
        .map((video) => {
          const match = getTopicMatchesForVideo(video, category).find((entry) => entry.label === topic.label);

          return {
            video,
            score: match?.score ?? 0,
          };
        })
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score);

      return {
        topic,
        videos: scoredVideos.map((entry) => entry.video),
        totalScore: scoredVideos.reduce((sum, entry) => sum + entry.score, 0),
      };
    })
    .sort((left, right) => {
      if (right.totalScore !== left.totalScore) {
        return right.totalScore - left.totalScore;
      }

      if (right.videos.length !== left.videos.length) {
        return right.videos.length - left.videos.length;
      }

      return left.topic.label.localeCompare(right.topic.label);
    });
}

export function getActiveTopicGroups(items: VideoItem[], category: BrowseCategory) {
  return groupVideosByTopic(items, category).filter(
    (group) => group.videos.length >= 2 || (group.videos.length >= 1 && group.totalScore >= 4),
  );
}

export function getTopicCoverage(items: VideoItem[], category: BrowseCategory): TopicCoverage[] {
  return getTopicDefinitions(category)
    .map((topic) => {
      const strongVideos = items
        .map((video) => {
          const score =
            getTopicMatchesForVideo(video, category).find((entry) => entry.label === topic.label)?.score ?? 0;

          return { video, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score);

      const weakFallbackVideos =
        strongVideos.length === 0
          ? items
              .map((video) => ({
                video,
                score: getWeakTopicFallbackScore(video, topic, category),
              }))
              .filter((entry) => entry.score >= 2)
              .sort((left, right) => right.score - left.score)
              .slice(0, 2)
          : [];

      const videos = strongVideos.length > 0 ? strongVideos.map((entry) => entry.video) : weakFallbackVideos.map((entry) => entry.video);
      const totalScore =
        strongVideos.length > 0
          ? strongVideos.reduce((sum, entry) => sum + entry.score, 0)
          : weakFallbackVideos.reduce((sum, entry) => sum + entry.score, 0);

      let coverageState: TopicCoverageState = "empty";

      if (strongVideos.length >= 2 || (strongVideos.length >= 1 && totalScore >= 4)) {
        coverageState = "active";
      } else if (videos.length > 0) {
        coverageState = "light";
      }

      return {
        label: topic.label,
        description: topic.description,
        videoCount: videos.length,
        totalScore,
        coverageState,
        isActive: coverageState === "active",
        statusLabel:
          coverageState === "active"
            ? "Active now"
            : coverageState === "light"
              ? "Light coverage"
              : "Quiet right now",
        videos,
      };
    })
    .sort((left, right) => {
      const order: Record<TopicCoverageState, number> = { active: 0, light: 1, empty: 2 };

      if (order[left.coverageState] !== order[right.coverageState]) {
        return order[left.coverageState] - order[right.coverageState];
      }

      if (right.videoCount !== left.videoCount) {
        return right.videoCount - left.videoCount;
      }

      if (right.totalScore !== left.totalScore) {
        return right.totalScore - left.totalScore;
      }

      return left.label.localeCompare(right.label);
    });
}

export function getRelatedVideosForTopic(
  items: VideoItem[],
  category: BrowseCategory,
  topicLabel: string,
  count: number,
) {
  const topic = getTopicDefinitions(category).find((entry) => entry.label === topicLabel);

  if (!topic) {
    return [];
  }

  return items
    .map((video) => {
      const strongScore =
        getTopicMatchesForVideo(video, category).find((entry) => entry.label === topicLabel)?.score ?? 0;
      const weakScore = getWeakTopicFallbackScore(video, topic, category);
      return { video, score: Math.max(strongScore, weakScore) };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, count)
    .map((entry) => entry.video);
}

export function normalizeBrowseCategoryFromText(
  title: string,
  description: string,
  fallback: BrowseCategory,
): BrowseCategory {
  const scores = getBrowseCategoryScoresFromText(title, description, fallback);

  return (Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] ??
    fallback) as BrowseCategory;
}

export function getBrowseCategoryScoresFromText(
  title: string,
  description: string,
  fallback: BrowseCategory,
) {
  const haystack = `${title} ${description}`;
  const scores: Record<BrowseCategory, number> = {
    "AI & Tech": fallback === "AI & Tech" ? 3 : 0,
    Physics: fallback === "Physics" ? 3 : 0,
    Mathematics: fallback === "Mathematics" ? 3 : 0,
    Science: fallback === "Science" ? 3 : 0,
  };

  (Object.keys(titleSignals) as BrowseCategory[]).forEach((category) => {
    for (const pattern of titleSignals[category]) {
      if (pattern.test(haystack)) {
        scores[category] += 4;
      }
    }

    for (const pattern of categoryFallbackSignals[category]) {
      if (pattern.test(haystack)) {
        scores[category] += 1;
      }
    }
  });

  return scores;
}

export function scoreVideoForCuration(video: VideoItem) {
  let score = 0;

  if (video.durationSeconds) {
    if (video.durationSeconds >= 8 * 60) score += 10;
    else if (video.durationSeconds >= 3 * 60) score += 6;
    else if (video.durationSeconds >= 90) score += 2;
    else score -= 8;
  }

  if (video.source === "youtube") score += 1;
  if (hasPlayableYouTubeId(video)) score += 2;
  if (video.description.length >= 80) score += 3;
  if (video.description.length < 24) score -= 5;
  if (video.title.length <= 90) score += 2;
  if (video.title.length > 130) score -= 2;
  if (isLikelyShortForm(video)) score -= 10;
  if (isLikelyVerticalThumbnail(video)) score -= 5;
  if (hasPatternMatch(video.title, lowFitTitlePatterns)) score -= 6;
  if (hasPatternMatch(video.description, weakDescriptionPatterns)) score -= 4;

  return score;
}

export function isGoodFeedCandidate(video: VideoItem) {
  return scoreVideoForCuration(video) >= -2;
}

export function getRecencyBonus(video: VideoItem) {
  if (!video.publishedAtISO) {
    return 0;
  }

  const ageHours = Math.max(0, (Date.now() - new Date(video.publishedAtISO).getTime()) / (1000 * 60 * 60));

  if (ageHours <= 12) return 6;
  if (ageHours <= 24) return 4;
  if (ageHours <= 72) return 2;
  if (ageHours <= 168) return 1;
  return 0;
}

export function getVideoClusterKey(video: VideoItem) {
  const category = getBrowseCategoryForVideo(video);
  const primaryTopic = getPrimaryTopicForVideo(video, category);
  return `${category}:${primaryTopic}`;
}

export function buildVideoClusters(items: VideoItem[], maxClusters = 12): VideoCluster[] {
  const grouped = new Map<string, VideoItem[]>();

  for (const video of items) {
    const key = getVideoClusterKey(video);
    grouped.set(key, [...(grouped.get(key) ?? []), video]);
  }

  return [...grouped.entries()]
    .map(([clusterKey, videos]) => {
      const browseCategory = getBrowseCategoryForVideo(videos[0]);
      const primaryTopic = getPrimaryTopicForVideo(videos[0], browseCategory);
      const rankedVideos = [...videos].sort((left, right) => {
        const scoreDiff =
          (right.curationScore ?? scoreVideoForCuration(right)) + getRecencyBonus(right) -
          ((left.curationScore ?? scoreVideoForCuration(left)) + getRecencyBonus(left));

        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        const rightDate = right.publishedAtISO ? new Date(right.publishedAtISO).getTime() : 0;
        const leftDate = left.publishedAtISO ? new Date(left.publishedAtISO).getTime() : 0;
        return rightDate - leftDate;
      });

      return {
        id: clusterKey,
        label: primaryTopic,
        browseCategory,
        primaryTopic,
        primaryVideo: rankedVideos[0],
        supportingVideos: rankedVideos.slice(1, 4),
        videos: rankedVideos,
        score: rankedVideos
          .slice(0, 3)
          .reduce(
            (total, video) => total + (video.curationScore ?? scoreVideoForCuration(video)) + getRecencyBonus(video),
            0,
          ),
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, maxClusters);
}

export function selectInsightClusters(items: VideoItem[], options: InsightSelectionOptions) {
  const excludedSlugs = new Set(options.excludedSlugs ?? []);
  const clusters = buildVideoClusters(
    items.filter((item) => !excludedSlugs.has(item.slug)),
    Math.max(16, options.count * 3),
  );
  const selected: VideoCluster[] = [];
  const usedCategories = new Map<BrowseCategory, number>();
  const usedVideos = new Set<string>(excludedSlugs);

  for (const cluster of clusters) {
    if (selected.length >= options.count) {
      break;
    }

    const categoryCount = usedCategories.get(cluster.browseCategory) ?? 0;
    const clusterVideoSlugs = cluster.videos.map((video) => video.slug);

    if (clusterVideoSlugs.some((slug) => usedVideos.has(slug))) {
      continue;
    }

    if (categoryCount >= 2 && selected.length < options.count - 1) {
      continue;
    }

    selected.push(cluster);
    usedCategories.set(cluster.browseCategory, categoryCount + 1);
    clusterVideoSlugs.forEach((slug) => usedVideos.add(slug));
  }

  if (selected.length < options.count) {
    for (const cluster of clusters) {
      if (selected.length >= options.count) {
        break;
      }

      if (selected.some((item) => item.id === cluster.id)) {
        continue;
      }

      const clusterVideoSlugs = cluster.videos.map((video) => video.slug);

      if (clusterVideoSlugs.some((slug) => usedVideos.has(slug))) {
        continue;
      }

      selected.push(cluster);
      clusterVideoSlugs.forEach((slug) => usedVideos.add(slug));
    }
  }

  return selected.slice(0, options.count);
}

function scoreVideoForSurface(
  video: VideoItem,
  items: VideoItem[],
  options: SelectionOptions,
) {
  const category = getBrowseCategoryForVideo(video);
  const categoryCounts = getCategoryCounts(items);
  const categoryScarcityBonus = Math.max(
    0,
    4 - (categoryCounts[category] ?? 0),
  );
  const baseScore = video.curationScore ?? scoreVideoForCuration(video);
  const recencyBoost = options.preferRecency ? getRecencyBonus(video) : getRecencyBonus(video) * 0.7;
  const topicDiversityBonus = getTopicDiversityScore(video, items) * 0.18;
  const diversityBoost =
    Math.min(2, getTopicsForVideo(video, category).length) + categoryScarcityBonus * 0.35 + topicDiversityBonus;
  const repetitionPenalty = getExposurePenalty(video, options.surface ?? "global");
  const randomnessFactor = getRotationJitter(video.slug, options.surface) * 1.5;

  return baseScore + recencyBoost + diversityBoost + randomnessFactor - repetitionPenalty;
}

function selectDiverseVideos(items: VideoItem[], options: SelectionOptions) {
  const selected: VideoItem[] = [];
  const usedSlugs = new Set(options.excludedSlugs ?? []);
  const channelCounts = new Map<string, number>();
  const clusterCounts = new Map<string, number>();
  const usedCategories = new Set<BrowseCategory>();
  const maxPerChannel = options.maxPerChannel ?? (options.count <= 4 ? 1 : 2);
  const maxPerCluster = options.maxPerCluster ?? 1;
  const surface = options.surface ?? "global";

  pruneExposureStore();

  const ranked = [...items].sort(
    (left, right) => scoreVideoForSurface(right, items, options) - scoreVideoForSurface(left, items, options),
  );

  for (const video of ranked) {
    if (selected.length >= options.count) {
      break;
    }

    if (usedSlugs.has(video.slug)) {
      continue;
    }

    const category = getBrowseCategoryForVideo(video);
    const clusterKey = getVideoClusterKey(video);
    const sameChannelCount = channelCounts.get(video.channel) ?? 0;
    const sameClusterCount = clusterCounts.get(clusterKey) ?? 0;
    const isCategoryAlreadyUsed = usedCategories.has(category);

    if (sameChannelCount >= maxPerChannel) {
      continue;
    }

    if (sameClusterCount >= maxPerCluster) {
      continue;
    }

    if (selected.length < Math.min(3, options.count) && isCategoryAlreadyUsed) {
      continue;
    }

    selected.push(video);
    usedSlugs.add(video.slug);
    channelCounts.set(video.channel, sameChannelCount + 1);
    clusterCounts.set(clusterKey, sameClusterCount + 1);
    usedCategories.add(category);
  }

  if (selected.length < options.count) {
    for (const video of ranked) {
      if (selected.length >= options.count) {
        break;
      }

      if (usedSlugs.has(video.slug)) {
        continue;
      }

      selected.push(video);
      usedSlugs.add(video.slug);
    }
  }

  recordExposure(surface, selected);
  return selected;
}

export function selectFeaturedVideo(items: VideoItem[]) {
  const candidates = [...items]
    .filter((item) => !isLikelyShortForm(item))
    .filter((item) => !item.youtubeVideoId || hasPlayableYouTubeId(item))
    .filter((item) => (item.curationScore ?? scoreVideoForCuration(item)) >= 2);

  if (candidates.length === 0) {
    return items[0] ?? null;
  }

  pruneExposureStore();

  const selected = [...candidates]
    .sort((left, right) => {
      const scoreDifference = scoreFeaturedCandidate(right, candidates) - scoreFeaturedCandidate(left, candidates);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return getPublishedTimestamp(right) - getPublishedTimestamp(left);
    })
    .slice(0, 1);

  recordExposure("homepage-featured", selected);

  return selected[0] ?? items[0] ?? null;
}

export function selectLatestVideos(items: VideoItem[], count: number, excludedSlugs: string[] = []) {
  const eligible = items
    .filter((item) => !excludedSlugs.includes(item.slug))
    .filter(
      (item) =>
        !isLikelyShortForm(item) &&
        isGoodFeedCandidate(item) &&
        (!item.youtubeVideoId || hasPlayableYouTubeId(item)),
    );

  const selected = selectDiverseVideos(eligible, {
    count,
    excludedSlugs,
    preferRecency: true,
    surface: "homepage-latest",
    maxPerChannel: 1,
    maxPerCluster: 1,
  });

  if (selected.length >= count) {
    return selected;
  }

  const fallback = items.filter(
    (item) => !excludedSlugs.includes(item.slug) && !selected.some((picked) => picked.slug === item.slug),
  );
  return [...selected, ...fallback].slice(0, count);
}

export function selectTrendingVideos(items: VideoItem[], count: number, excludedSlugs: string[] = []) {
  const eligible = [...items]
    .filter((item) => !excludedSlugs.includes(item.slug))
    .filter(isGoodFeedCandidate)
    .filter((item) => !item.youtubeVideoId || hasPlayableYouTubeId(item));

  const selected = selectDiverseVideos(eligible, {
    count,
    excludedSlugs,
    preferRecency: false,
    surface: "trending",
    maxPerChannel: 2,
    maxPerCluster: 1,
  });

  if (selected.length >= count) {
    return selected;
  }

  return [...selected, ...eligible.filter((item) => !selected.some((picked) => picked.slug === item.slug))].slice(
    0,
    count,
  );
}

export function selectHomepageSections(
  items: VideoItem[],
  options?: {
    latestCount?: number;
    trendingCount?: number;
  },
): HomepageSelections {
  const latestCount = options?.latestCount ?? 4;
  const trendingCount = options?.trendingCount ?? 3;
  const featured = selectFeaturedVideo(items);
  const latest = selectLatestVideos(items, latestCount, featured ? [featured.slug] : []);
  const excludedSlugs = new Set([
    ...(featured ? [featured.slug] : []),
    ...latest.map((item) => item.slug),
  ]);
  const trending = selectTrendingVideos(items, trendingCount, [...excludedSlugs]);

  return {
    featured,
    latest,
    trending,
  };
}
