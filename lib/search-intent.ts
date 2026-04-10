import type { BrowseCategory } from "@/lib/site-data";

export type SearchDifficultyIntent = "beginner" | "advanced" | null;

export type SearchIntent = {
  normalizedQuery: string;
  tokens: string[];
  topicTerms: string[];
  categoryHint: BrowseCategory | null;
  difficulty: SearchDifficultyIntent;
  directCategoryQuery: boolean;
};

const beginnerPatterns = [
  /\b(beginner|beginners|basics|basic|intro|introduction|explained|fundamentals|starter)\b/i,
];

const advancedPatterns = [
  /\b(advanced|deep dive|deep-dive|lecture|seminar|masterclass|formal|derivation|full course)\b/i,
];

const categoryTokenMap: Record<BrowseCategory, RegExp[]> = {
  "AI & Tech": [/\b(ai|artificial intelligence|machine learning|robotics|computer vision|ai ethics)\b/i],
  Physics: [/\b(physics|quantum|space|gravity|mechanics|engineering|thermo|astrophysics)\b/i],
  Mathematics: [/\b(math|mathematics|calculus|algebra|geometry|probability|theorem|proof)\b/i],
  Science: [/\b(science|biology|chemistry|medicine|medical|climate|ecology|genetics|brain)\b/i],
};

const stopTerms = new Set([
  "about",
  "advanced",
  "basics",
  "beginner",
  "beginners",
  "deep",
  "dive",
  "explained",
  "for",
  "from",
  "full",
  "how",
  "intro",
  "introduction",
  "lecture",
  "masterclass",
  "overview",
  "seminar",
  "the",
  "what",
]);

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function tokenize(query: string) {
  return normalizeQuery(query)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function detectCategoryHint(query: string) {
  const normalized = normalizeQuery(query);

  for (const [category, patterns] of Object.entries(categoryTokenMap) as Array<
    [BrowseCategory, RegExp[]]
  >) {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      return category;
    }
  }

  return null;
}

function isDirectCategoryQuery(query: string, categoryHint: BrowseCategory | null) {
  if (!categoryHint) {
    return false;
  }

  const normalized = normalizeQuery(query);
  const directQueries: Record<BrowseCategory, string[]> = {
    "AI & Tech": ["ai", "ai tech", "artificial intelligence", "machine learning", "technology", "tech"],
    Physics: ["physics", "quantum physics", "engineering"],
    Mathematics: ["math", "mathematics"],
    Science: ["science", "biology", "chemistry", "medicine", "climate science"],
  };

  return directQueries[categoryHint].includes(normalized);
}

export function parseSearchIntent(query: string): SearchIntent {
  const normalizedQuery = normalizeQuery(query);
  const tokens = tokenize(query);
  const categoryHint = detectCategoryHint(query);
  const difficulty: SearchDifficultyIntent = beginnerPatterns.some((pattern) => pattern.test(query))
    ? "beginner"
    : advancedPatterns.some((pattern) => pattern.test(query))
      ? "advanced"
      : null;

  return {
    normalizedQuery,
    tokens,
    topicTerms: tokens.filter((token) => token.length >= 4 && !stopTerms.has(token)),
    categoryHint,
    difficulty,
    directCategoryQuery: isDirectCategoryQuery(query, categoryHint),
  };
}
