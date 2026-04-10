import type { BrowseCategory, VideoItem } from "@/lib/site-data";
import type { YouTubeChannelSource } from "@/lib/sources/youtube-channels";
import { getBrowseCategoryScoresFromText } from "@/lib/video-curation";

export type EducationLevel = "general" | "middle-school" | "high-school" | "college" | "advanced";

export type CategoryAssignment = {
  category: BrowseCategory;
  confidence: number;
  score: number;
  isPrimary: boolean;
  reasons: string[];
};

export type VideoClassificationResult = {
  primaryCategory: BrowseCategory | null;
  assignments: CategoryAssignment[];
  confidence: number;
  educationLevel: EducationLevel;
  keywords: string[];
  tags: string[];
  language: string | null;
  excludedReason: string | null;
  debug: {
    trustedChannel: string;
    scoreByCategory: Record<BrowseCategory, number>;
    reasonsByCategory: Record<BrowseCategory, string[]>;
  };
};

type ClassificationInput = Pick<VideoItem, "title" | "description" | "channel"> & {
  tags?: string[];
  language?: string | null;
  source: YouTubeChannelSource;
};

const browseCategories: BrowseCategory[] = ["AI & Tech", "Physics", "Mathematics", "Science"];
const categoryAliases: Record<BrowseCategory, RegExp[]> = {
  "AI & Tech": [/\b(ai|artificial intelligence|machine learning|computer vision|robotics|automation|software|computer science)\b/i],
  Physics: [/\b(physics|quantum|space|rocket|mechanics|relativity|thermodynamics|engineering|structural|hydraulics)\b/i],
  Mathematics: [/\b(math|mathematics|algebra|geometry|calculus|probability|proof|theorem|statistics)\b/i],
  Science: [/\b(science|biology|chemistry|medicine|medical|neuroscience|climate|ecology|anatomy|physiology|immunology|genetics|pathology)\b/i],
};
const educationLevelPatterns: Array<{ level: EducationLevel; pattern: RegExp }> = [
  { level: "advanced", pattern: /\b(graduate|phd|research seminar|lecture series|proof sketch|formal derivation)\b/i },
  { level: "college", pattern: /\b(university|undergraduate|college|lecture|course|calculus|linear algebra)\b/i },
  { level: "high-school", pattern: /\b(high school|exam|gcse|sat|ap |intro to)\b/i },
  { level: "middle-school", pattern: /\b(middle school|kids|young learners)\b/i },
];
const lowSignalContentPatterns = [
  /\b(weekly|channel|creator)\s+(update|news)\b/i,
  /\bbehind the scenes\b/i,
  /\bstudio notes\b/i,
  /\bannouncement\b/i,
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractKeywords(value: string) {
  return uniqueStrings(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length >= 4)
      .filter(
        (term) =>
          ![
            "with",
            "from",
            "that",
            "this",
            "about",
            "have",
            "they",
            "what",
            "when",
            "where",
            "which",
            "into",
            "video",
            "guest",
            "really",
            "doing",
          ].includes(term),
      ),
  ).slice(0, 12);
}

function inferEducationLevel(title: string, description: string, tags: string[], fallback: EducationLevel) {
  const haystack = `${title} ${description} ${tags.join(" ")}`;

  for (const entry of educationLevelPatterns) {
    if (entry.pattern.test(haystack)) {
      return entry.level;
    }
  }

  return fallback;
}

export function classifyVideoMetadata(input: ClassificationInput): VideoClassificationResult {
  const tags = uniqueStrings(input.tags ?? []);
  const haystack = `${input.title} ${input.description} ${input.channel} ${tags.join(" ")}`.trim();
  const baseScores = getBrowseCategoryScoresFromText(input.title, `${input.description} ${tags.join(" ")}`, input.source.defaultCategory);
  const scoreByCategory: Record<BrowseCategory, number> = { ...baseScores };
  const reasonsByCategory = Object.fromEntries(
    browseCategories.map((category) => [category, [] as string[]]),
  ) as Record<BrowseCategory, string[]>;

  for (const category of browseCategories) {
    if (!input.source.allowedCategories.includes(category)) {
      scoreByCategory[category] = Number.NEGATIVE_INFINITY;
      reasonsByCategory[category].push("category not approved for this trusted channel");
      continue;
    }

    if (category === input.source.defaultCategory) {
      scoreByCategory[category] += 3;
      reasonsByCategory[category].push("trusted channel default category");
    }

    const aliasMatches = categoryAliases[category].filter((pattern) => pattern.test(haystack)).length;

    if (aliasMatches > 0) {
      scoreByCategory[category] += aliasMatches * 2;
      reasonsByCategory[category].push(`matched ${aliasMatches} category-specific metadata signals`);
    }

    const channelKeywordMatches = (input.source.categoryKeywords?.[category] ?? []).filter((keyword) =>
      haystack.toLowerCase().includes(keyword.toLowerCase()),
    ).length;

    if (channelKeywordMatches > 0) {
      scoreByCategory[category] += channelKeywordMatches * 2;
      reasonsByCategory[category].push(`matched ${channelKeywordMatches} trusted-channel keywords`);
    }
  }

  const ranked = browseCategories
    .map((category) => ({ category, score: scoreByCategory[category] }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => right.score - left.score);
  const top = ranked[0];
  const second = ranked[1];
  const strongSignalCount = browseCategories.reduce((total, category) => {
    const reasons = reasonsByCategory[category];
    const signalCount = reasons.filter((reason) => reason !== "trusted channel default category").length;
    return total + signalCount;
  }, 0);

  if (lowSignalContentPatterns.some((pattern) => pattern.test(haystack)) && strongSignalCount === 0) {
    return {
      primaryCategory: null,
      assignments: [],
      confidence: 0,
      educationLevel: inferEducationLevel(input.title, input.description, tags, input.source.educationLevel ?? "general"),
      keywords: extractKeywords(`${input.title} ${input.description} ${tags.join(" ")}`),
      tags,
      language: input.language ?? input.source.language ?? null,
      excludedReason: "low-signal channel update content",
      debug: {
        trustedChannel: input.source.name,
        scoreByCategory,
        reasonsByCategory,
      },
    };
  }

  if (!top || top.score < 5) {
    return {
      primaryCategory: null,
      assignments: [],
      confidence: 0,
      educationLevel: inferEducationLevel(input.title, input.description, tags, input.source.educationLevel ?? "general"),
      keywords: extractKeywords(`${input.title} ${input.description} ${tags.join(" ")}`),
      tags,
      language: input.language ?? input.source.language ?? null,
      excludedReason: "classification confidence too low",
      debug: {
        trustedChannel: input.source.name,
        scoreByCategory,
        reasonsByCategory,
      },
    };
  }

  const scoreGap = top.score - (second?.score ?? 0);
  const confidence = clamp(0.45 + scoreGap * 0.08 + Math.min(top.score, 14) * 0.02);
  const assignments = ranked
    .filter((entry) => entry.score >= Math.max(5, top.score - 3))
    .slice(0, 3)
    .map((entry, index) => ({
      category: entry.category,
      score: entry.score,
      isPrimary: index === 0,
      confidence:
        index === 0
          ? confidence
          : clamp(confidence - (top.score - entry.score) * 0.09 - index * 0.05),
      reasons: reasonsByCategory[entry.category].length > 0 ? reasonsByCategory[entry.category] : ["metadata score"],
    }))
    .filter((assignment) => assignment.confidence >= 0.5);

  const primaryAssignment = assignments.find((assignment) => assignment.isPrimary) ?? null;

  if (!primaryAssignment) {
    return {
      primaryCategory: null,
      assignments: [],
      confidence: 0,
      educationLevel: inferEducationLevel(input.title, input.description, tags, input.source.educationLevel ?? "general"),
      keywords: extractKeywords(`${input.title} ${input.description} ${tags.join(" ")}`),
      tags,
      language: input.language ?? input.source.language ?? null,
      excludedReason: "no valid category assignment",
      debug: {
        trustedChannel: input.source.name,
        scoreByCategory,
        reasonsByCategory,
      },
    };
  }

  return {
    primaryCategory: primaryAssignment.category,
    assignments,
    confidence: primaryAssignment.confidence,
    educationLevel: inferEducationLevel(input.title, input.description, tags, input.source.educationLevel ?? "general"),
    keywords: extractKeywords(`${input.title} ${input.description} ${tags.join(" ")}`),
    tags,
    language: input.language ?? input.source.language ?? null,
    excludedReason: null,
    debug: {
      trustedChannel: input.source.name,
      scoreByCategory,
      reasonsByCategory,
    },
  };
}

export function buildAssignmentReasonSummary(assignments: CategoryAssignment[]) {
  return assignments.map((assignment) => ({
    category: assignment.category,
    confidence: assignment.confidence,
    reasons: assignment.reasons,
  }));
}
