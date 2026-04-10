import { getVideoLevelLabel, type BrowseCategory, type VideoItem } from "@/lib/site-data";
import { parseSearchIntent, type SearchIntent } from "@/lib/search-intent";

export type SearchFilters = {
  query: string;
  category?: BrowseCategory | null;
  topic?: string | null;
};

export type SearchDebugEntry = {
  slug: string;
  score: number;
  included: boolean;
  reasons: string[];
  primaryCategory: string;
};

export type SearchMatchEntry = {
  video: VideoItem;
  score: number;
  reason: string;
};

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function tokenize(query: string) {
  return normalizeQuery(query)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function getVideoCategorySet(video: VideoItem) {
  const categories = video.categories?.length ? video.categories : [video.primaryCategory ?? video.category];
  return new Set(categories.filter(Boolean) as BrowseCategory[]);
}

function getSearchReason(
  video: VideoItem,
  intent: SearchIntent,
  explicitCategory: BrowseCategory | null,
  matchedTopicHint: string | null,
) {
  const levelLabel = getVideoLevelLabel(video);

  if (intent.difficulty === "beginner" && (levelLabel === "Beginner" || levelLabel === "Quick start")) {
    return "Beginner-friendly";
  }

  if (intent.difficulty === "advanced" && (levelLabel === "Advanced" || levelLabel === "Deep dive")) {
    return "Deep dive";
  }

  if (matchedTopicHint) {
    return `Related to ${matchedTopicHint}`;
  }

  if (explicitCategory) {
    return `Strong match for ${explicitCategory}`;
  }

  if (intent.categoryHint) {
    return `Strong match for ${intent.categoryHint}`;
  }

  return "Search match";
}

export function searchEducationalVideos(items: VideoItem[], filters: SearchFilters) {
  const query = normalizeQuery(filters.query);
  const tokens = tokenize(filters.query);
  const intent = parseSearchIntent(filters.query);
  const explicitCategory = filters.category ?? null;
  const queryCategory = explicitCategory ?? intent.categoryHint;
  const categoryOnlyQuery = intent.directCategoryQuery;
  const debug: SearchDebugEntry[] = [];

  if (!query) {
    return { results: [] as VideoItem[], matches: [] as SearchMatchEntry[], debug, intent };
  }

  const scored = items
    .map((video) => {
      const text = `${video.title} ${video.description} ${video.channel} ${(video.tags ?? []).join(" ")} ${(video.keywords ?? []).join(" ")}`.toLowerCase();
      const title = video.title.toLowerCase();
      const categorySet = getVideoCategorySet(video);
      const levelLabel = getVideoLevelLabel(video);
      const videoTopics = video.topics ?? [];
      const matchedTopicHint = intent.topicTerms.find(
        (term) =>
          videoTopics.some((topic) => topic.toLowerCase().includes(term)) ||
          text.includes(term),
      ) ?? null;
      const reasons: string[] = [];
      let score = 0;
      let textEvidenceScore = 0;

      if (explicitCategory && !categorySet.has(explicitCategory)) {
        reasons.push("excluded: missing requested category assignment");
        debug.push({
          slug: video.slug,
          score: 0,
          included: false,
          reasons,
          primaryCategory: video.primaryCategory ?? video.category,
        });
        return null;
      }

      if (queryCategory && !categorySet.has(queryCategory)) {
        score -= 10;
        reasons.push("penalized for category mismatch");
      } else if (queryCategory && categorySet.has(queryCategory)) {
        score += 12;
        reasons.push("matched query category intent");
      }

      if (title.includes(query)) {
        score += 24;
        textEvidenceScore += 24;
        reasons.push("title contains full query");
      }

      if (video.channel.toLowerCase().includes(query)) {
        score += 12;
        textEvidenceScore += 12;
        reasons.push("channel contains full query");
      }

      if ((video.tags ?? []).some((tag) => tag.toLowerCase().includes(query))) {
        score += 10;
        textEvidenceScore += 10;
        reasons.push("tag contains full query");
      }

      if ((video.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(query))) {
        score += 8;
        textEvidenceScore += 8;
        reasons.push("keyword contains full query");
      }

      for (const token of tokens) {
        if (title.includes(token)) {
          score += 6;
          textEvidenceScore += 6;
          reasons.push(`title matched token "${token}"`);
          continue;
        }

        if (text.includes(token)) {
          score += 3;
          textEvidenceScore += 3;
          reasons.push(`metadata matched token "${token}"`);
        }
      }

      if (intent.difficulty === "beginner") {
        if (levelLabel === "Beginner" || levelLabel === "Quick start") {
          score += 10;
          reasons.push("matched beginner intent");
        } else if (levelLabel === "Advanced" || levelLabel === "Deep dive") {
          score -= 4;
          reasons.push("penalized for advanced depth");
        }
      }

      if (intent.difficulty === "advanced") {
        if (levelLabel === "Advanced" || levelLabel === "Deep dive") {
          score += 10;
          reasons.push("matched advanced intent");
        } else if (levelLabel === "Beginner" || levelLabel === "Quick start") {
          score -= 3;
          reasons.push("penalized for shallow depth");
        }
      }

      if (matchedTopicHint) {
        score += 8;
        reasons.push(`matched topic intent "${matchedTopicHint}"`);
      }

      if (filters.topic && !(video.topics ?? []).includes(filters.topic)) {
        score -= 8;
        reasons.push("penalized for topic mismatch");
      } else if (filters.topic && (video.topics ?? []).includes(filters.topic)) {
        score += 10;
        reasons.push("matched requested topic");
      }

      score += Math.max(0, video.curationScore ?? 0) * 0.35;
      score += (video.classificationConfidence ?? 0) * 8;
      score += video.trustedSource ? 4 : 0;

      const hasEvidence = textEvidenceScore > 0 || categoryOnlyQuery;
      const included =
        score > 0 &&
        hasEvidence &&
        (!queryCategory || categorySet.has(queryCategory) || score >= 20);

      debug.push({
        slug: video.slug,
        score,
        included,
        reasons,
        primaryCategory: video.primaryCategory ?? video.category,
      });

      return included
        ? {
            video,
            score,
            reason: getSearchReason(video, intent, explicitCategory, matchedTopicHint),
          }
        : null;
    })
    .filter((entry): entry is SearchMatchEntry => Boolean(entry))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if ((right.video.classificationConfidence ?? 0) !== (left.video.classificationConfidence ?? 0)) {
        return (right.video.classificationConfidence ?? 0) - (left.video.classificationConfidence ?? 0);
      }

      return (right.video.curationScore ?? 0) - (left.video.curationScore ?? 0);
    });

  return {
    results: scored.map((entry) => entry.video),
    matches: scored,
    debug: debug.sort((left, right) => right.score - left.score),
    intent,
  };
}
