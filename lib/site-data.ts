export type VideoItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  primaryCategory?: BrowseCategory;
  categories?: BrowseCategory[];
  channel: string;
  sourceChannelId?: string;
  trustedChannelKey?: string;
  trustedSource?: boolean;
  publishedAt: string;
  publishedAtISO?: string;
  duration: string;
  durationSeconds?: number;
  description: string;
  thumbnail: string;
  alt: string;
  youtubeVideoId?: string;
  source?: "mock" | "youtube";
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  isShortForm?: boolean;
  curationScore?: number;
  classificationConfidence?: number;
  qualityScore?: number;
  educationLevel?: string;
  language?: string;
  tags?: string[];
  keywords?: string[];
  topics?: string[];
  ingestionTrace?: {
    excludedReason?: string | null;
    assignments?: Array<{
      category: BrowseCategory;
      confidence: number;
      reasons: string[];
    }>;
    scoreByCategory?: Partial<Record<BrowseCategory, number>>;
  };
  createdAt?: string;
  ingestedAt?: string;
  updatedAt?: string;
};

export type VideoCardItem = VideoItem;

export type CategoryItem = {
  title: string;
  description: string;
  image: string;
  alt: string;
  className: string;
  browseCategory: BrowseCategory;
};

export type TrendingItem = {
  id: string;
  slug: string;
  rank?: string;
  label?: string;
  reason?: string;
  title: string;
  category: BrowseCategory;
  channel: string;
  publishedAt: string;
  shortDescription: string;
  thumbnail: string;
  youtubeVideoId?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  isShortForm?: boolean;
  topics?: string[];
};

export type ExploreNowSection = {
  id: string;
  title: string;
  description: string;
  category: BrowseCategory | "All";
  items: TrendingItem[];
};

export type InsightCluster = {
  id: string;
  title: string;
  summary: string;
  takeaway: string;
  browseCategory: BrowseCategory;
  topic: string;
  primaryVideo: VideoItem;
  supportingVideos: VideoItem[];
};

export type RecommendationSummary = {
  exploredCount: number;
  topCategory: BrowseCategory | null;
  lastViewedTopic: string | null;
  nextTopicInsight: InsightCluster | null;
  continuePath:
    | {
        title: string;
        slug: string;
        percentComplete: number;
        nextInsightSlug: string | null;
      }
    | null;
};

export type RecommendationGroups = {
  continueLearning: InsightCluster[];
  recommended: InsightCluster[];
  newInYourInterests: InsightCluster[];
  summary: RecommendationSummary;
};

export type DailyInsightsResponse = {
  dailyInsights: InsightCluster[];
};

export type DifficultyLevel = "intro" | "intermediate" | "advanced";

export type LearningPathProgress = {
  viewedCount: number;
  totalCount: number;
  percentComplete: number;
  nextInsightId: string | null;
  nextInsightSlug: string | null;
};

export type LearningPath = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: BrowseCategory;
  topic?: string;
  insightIds: string[];
  difficultyLevel: DifficultyLevel;
  estimatedLength: string;
  insights: InsightCluster[];
  progress?: LearningPathProgress;
};

export type BrowseCategory = "AI & Tech" | "Physics" | "Mathematics" | "Science";

export const navbarLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/categories" },
  { label: "Explore Now", href: "/trending" },
  { label: "Library", href: "/library" },
  { label: "About", href: "/about" },
];

export const heroContent = {
  badge: "Istitdlal",
  titlePrefix: "Discover trusted ",
  titleHighlight: "science and technology videos",
  titleSuffix: " in a cleaner learning flow.",
  description:
    "Browse serious science and technology videos through curated categories, topic lanes, and a lighter path back to what matters.",
  primaryCta: "Start browsing",
  secondaryCta: "Explore Now",
  statsLabel: "Browse",
  statsValue: "Home, categories, now",
  dashboardImage: "/lightbulb-hero.svg",
  dashboardAlt:
    "Glowing lightbulb illustration on a dark blue background",
};

export const valuePropositionSection = {
  heading: "How this platform is different",
  description:
    "Built to help you understand quickly, not just keep scrolling.",
  items: [
    {
      title: "Less noise, more signal",
      description:
        "Higher-signal insights instead of a raw upload dump.",
    },
    {
      title: "Understanding, not randomness",
      description:
        "Videos are connected into ideas, not left as isolated links.",
    },
    {
      title: "Personalized flow",
      description:
        "The homepage adapts to what you explore without needing an account.",
    },
    {
      title: "Progress that compounds",
      description:
        "Progress keeps your next useful step visible when you return.",
    },
  ],
};

export const howItWorksSection = {
  heading: "How it works",
  description:
    "A lightweight three-step flow that turns public video into a guided product experience.",
  steps: [
    {
      step: "01",
      title: "Discover insights",
      description:
        "Start with curated insight clusters instead of raw feeds so the important ideas surface immediately.",
    },
    {
      step: "02",
      title: "Understand concepts",
      description:
        "Move through categories, recommendations, and paths that connect related videos into clearer topic understanding.",
    },
    {
      step: "03",
      title: "Build knowledge over time",
      description:
        "Session-based progress and learning paths help users return to the right next step instead of starting over every visit.",
    },
  ],
};

export const homepageCtaSection = {
  title: "Ready to move from video browsing to structured understanding?",
  description:
    "Start with curated insights, continue a path, or jump into a topic map when you want more depth.",
  primaryCta: "Start Learning",
  primaryHref: "/categories",
  secondaryCta: "Explore Insights",
  secondaryHref: "/#todays-insights",
};

export const videos: VideoItem[] = [
  {
    id: "vid-quantum-multiverse",
    slug: "deciphering-the-quantum-multiverse",
    title: "Deciphering the Quantum Multiverse: A New Proof",
    category: "Physics",
    channel: "Institute for Advanced Study",
    publishedAt: "2h ago",
    duration: "42:15",
    description:
      "Leading theoretical physicists present a groundbreaking framework that suggests interactions between parallel realities are observable at the subatomic level.",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvFap3QeYr_QQzII6e0sIajcZtakFE-yxfcrTdkgdR3Q2eAmDRid6PkUEVjr7Ce_4q3oRDGLrCrwLOqUwhMK4-5LLYrffecCXt9QqxZs2KalNcyVk05GPxLdVAB_Jd3i8O-AlXoRi7sj_eT0SW2w1b41VXkgCr10xYtifpq_cYGerpsaHnDrph50pdayG46GrthvVLjKm5TNFauzMUwEmIxmqw7AWN5Xxnf4WpJijwSp9ne-IA6GAIYFpn9SHOAPSQgdNiigKqRA_D",
    alt: "Dramatic close-up of a quantum computer processor with glowing blue lights and intricate gold wiring in a dark high-tech environment",
  },
  {
    id: "vid-ai-state-of-play",
    slug: "the-2024-generative-ai-state-of-play",
    title: "The 2024 Generative AI State of Play",
    category: "AI & Tech",
    channel: "Neural Logic Media",
    publishedAt: "2h ago",
    duration: "12:45",
    description:
      "An executive overview of the latest model capabilities, product direction, and deployment trends shaping the generative AI landscape this year.",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDDWGHzQtOte0EWLwj_da7VZjf9TjfMHax-wZczGmB-nmVpSJmlr37T1Si1Vor9Cdi1E3bqUUYKsP-vjXZlPnGnPemPoMqNcmjZhGB8SEz5-zbSLV2xVsjScnMaD8n_WpvL9etD19bBkXWHKxPigvC9bK8nr_pNUSdlIo0-_C6zX-ICWs677BCbaJsgP1yEXhL5LEGiCWrP9p-GxdOcZQuktzlI6HinGDxUNF4MocpUqd2WOfQEWas7LQ_Xa52rkbpIiNMFQ0bEehIc",
    alt: "Digital representation of neural networks and artificial intelligence nodes in a dark void with bright blue connections",
  },
  {
    id: "vid-mars-oxygen",
    slug: "living-on-mars-the-oxygen-challenge",
    title: "Living on Mars: The Oxygen Challenge",
    category: "Space Science",
    channel: "CosmoQuest",
    publishedAt: "5h ago",
    duration: "18:12",
    description:
      "A practical breakdown of what sustained life support on Mars would require, from oxygen generation systems to habitat resilience under harsh conditions.",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD8siDdtnIG1OrVEW5-irOz1oEqna8XGW8aOaNbJuJO7iY_WwVnyB61C71JAHFUSqH6T3-pGoKjtLnhI6X41L_b3T-zOsANjIBCUYICotvQzeor2Bf6lgRXDHufAkY9OI0siUq_6kkOagq9kGCEAsh38bVN1r8eulGj0fw1uFbcXKkFCuKj5DitiiA9OTSXZs5wc_QtvksE162qOx2PNEkWIfgTwLcfqKO5NLuoGFwApMCrTIWFjBNTLjnh8QxS5mY-Vx5Me6jONcTT",
    alt: "Vibrant panoramic view of a Mars colony concept with futuristic domes under a dusty orange sky and red mountains",
  },
  {
    id: "vid-crispr-health",
    slug: "crispr-2-editing-the-future-of-health",
    title: "CRISPR 2.0: Editing the Future of Health",
    category: "Biology",
    channel: "BioInsight TV",
    publishedAt: "8h ago",
    duration: "24:50",
    description:
      "A close look at next-generation gene-editing techniques and how researchers are approaching precision medicine, safety, and scale.",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCglwyKwvdiO_6FfLN1FwoZIhNRlo5mr-3ScNp7nYUbJg4aNIeYbk3gcELSDLPvE7qGLrXzV1_JAE2blU7gjbZwROWn-uN65lyJcU1tKwP6282p7gINnVIgs7XzUfDhiavDCv2VkxPBuT-CiEmPCVmyS-oRvCmm0typBIv1mU_ZuI9RlI8fc9pruwELq2v88MUErb3i9baLWmVSnm-hp0XDc4KIMZGzZKrIZUvKeUzxcXkbqrPWKaK15TcZ6X-Y8fA9OcD66Y1-nUfi",
    alt: "Microscopic view of bright colorful DNA strands and cells in a glowing medical laboratory environment",
  },
  {
    id: "vid-riemann",
    slug: "solving-the-riemann-hypothesis",
    title: "Solving the Riemann Hypothesis?",
    category: "Mathematics",
    channel: "Prime Theory",
    publishedAt: "12h ago",
    duration: "09:15",
    description:
      "A concise walkthrough of what the Riemann Hypothesis actually states, why it matters, and how recent attempts frame the problem.",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQiqGuLJXe9HC3GGdQg3Guszng6qAg1cXz7EevwKwFbhnhJ3U0uyt18z1w5EghjfPt1DdI1zG2A7xYt62Uc4iVwGeWrZNSB0xsP0KqG_v5B7aJcAqMHkPoj7q15P5Nr4xtBDGefjRsM9H6wEeIZUSiOz7RUn9zUJ4W13LbKKTienAkextWg7du_65vjYrF5g2BffyNB4p4OgsuWqAM-6F7jaoVNHPGqn8--V-61dEpRVrDQa_JsPz7dCWTLq5mpwH4-SYL-oLoz6Mz",
    alt: "Artistic chalk drawing of complex mathematical equations and geometric shapes on a dark chalkboard",
  },
  {
    id: "vid-superconductors",
    slug: "room-temperature-superconductors-critical-reevaluation",
    title: "Room Temperature Superconductors: A Critical Re-evalution",
    category: "Materials Science",
    channel: "Lab Signal",
    publishedAt: "1h ago",
    duration: "31:40",
    description:
      "Researchers revisit the experimental claims, measurement methods, and replication efforts behind one of the most debated discoveries in modern physics.",
    thumbnail: "/thumbnails/superconductors.svg",
    alt: "Abstract close-up of scientific instrumentation and glowing lab components in a research environment",
  },
  {
    id: "vid-starship-flight-5",
    slug: "starship-flight-5-full-mission-breakdown",
    title: "Starship Flight 5: Full Mission Breakdown",
    category: "Space X",
    channel: "Launch Window",
    publishedAt: "3h ago",
    duration: "27:08",
    description:
      "A sequence-by-sequence review of launch operations, stage performance, and what the latest mission reveals about future heavy-lift systems.",
    thumbnail:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    alt: "Rocket lifting through clouds with bright exhaust and dramatic sky lighting",
  },
  {
    id: "vid-influenza-vaccine",
    slug: "universal-vaccine-for-influenza-new-human-trial-data",
    title: "A Universal Vaccine for Influenza? New Human Trial Data",
    category: "Medicine",
    channel: "MedBrief",
    publishedAt: "6h ago",
    duration: "16:54",
    description:
      "An overview of the newest human trial results, the immune-response signals researchers are watching, and the realistic path ahead.",
    thumbnail:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80",
    alt: "Clinical research environment with vaccine vials and soft laboratory lighting",
  },
];

export const categoriesSection = {
  heading: "Categories",
};

export const categoryBrowsePage = {
  heading: "Explore by Category",
  description:
    "Browse the current library through categories and topic coverage.",
  filters: ["All", "AI & Tech", "Physics", "Mathematics", "Science"] as const,
};

export const browseCategoryDescriptions: Record<BrowseCategory, string> = {
  "AI & Tech":
    "Model releases, product moves, robotics, and the systems shaping applied intelligence.",
  Physics:
    "Space, materials, energy, and the physics stories with the strongest explanatory depth.",
  Mathematics:
    "Proofs, visual reasoning, elegant problems, and the ideas behind modern mathematical thinking.",
  Science:
    "Biology, medicine, chemistry, and broader scientific research with practical relevance.",
};

export const categories: CategoryItem[] = [
  {
    title: "AI & Tech",
    description:
      "Machine learning, automation, and the architecture of the future silicon minds.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrWnH6XRoMFU-SOv3gVYvDHAquVCVG3hh4sYnl8EdgKLpc6K7lHSdDwIrlB-OHNtih37dsjYWjS-0XuXna3PW55dofkZG5AKbRnDQ8cOCAKB7Zq6gqtEjbL5NC2O4Kue-fhkIqceoRP5qy2WTD_Ed_H-QcW2QR0yPZN5sAG34xcGDZDbDvujDtmAtdIZpQWsGgxTh35MnIlqL_oL3HU81zQjP3bZXOfrB9iAmFvbFLCcCx9u2-s1zKUGp3L8Lbm0dMxnnXjVaIcByR",
    alt: "Rows of powerful server racks in a data center with glowing blue and green status lights reflecting on a polished floor",
    className: "md:col-span-8",
    browseCategory: "AI & Tech",
  },
  {
    title: "Physics",
    description:
      "Unlocking the fundamental laws governing matter, energy, and time.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuADpfUBwk2DZLOwRcr100ZkOWwM3te-RBiTYR--j4Y4SovHY-3dE-2lBw5lI8BLVEmdBKmN2WD_YLmHDOoJuBq2wdsGZBIlSm4I_8L8hEXWrn5xUBblE5iT5L5uHasEx6rO--bbFGksv6hqDuRzKd5AFegNxHVosTpGPjtVHHbDbYWQyg4WurlZ6tSPyyPuw2ZaqwR37WWL8EH6TC1jKZ8Y400oYs7LA6Lqo4DlHBgkl6frb0LHD3OOo1fLplTbUt0a9qEApoU2hc9y",
    alt: "Glowing nebula and galaxy in deep space with vibrant purples and oranges against a star-filled background",
    className: "md:col-span-4",
    browseCategory: "Physics",
  },
  {
    title: "Science",
    description: "Chemistry, biology, and environmental studies.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDNN0Oa9AYY9VkbddilnTVCEt-zEdRcN4kc8TGs9vnqXNqs6DbXWpKR08IF5Q2KKEYEw0-GbLvHhYjLMxSMR9AzlH2fsCZD8lJIuvnnOrdDAnbtH0zWMh07loOgna0ge6ZLt_ipVKutqLiLeYK1p9DZXe1zI4Y5nLgfgBoD84wn4Nb5VzUQlZU5igAeTf1tvYuXkbFPvszd9v1_h-6ZAlPZLxH6nKQZMFCAUWG9X6-sNZtOyctjggECxN73yuwNEgbiXZVM7DZq8PQ3",
    alt: "Close-up of a laboratory beaker with boiling liquid and smoke in a moody industrial scientific setting",
    className: "md:col-span-5",
    browseCategory: "Science",
  },
  {
    title: "Mathematics",
    description:
      "The universal language of logic, pattern, and numerical beauty.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7CYzNNbY0w4Q8AqSKBSkDMiaHzz355PocBvp0-IFwtF_4NKgrHfNr5gciSXA1gS916f3hHO_VMvZyr6803vqg_X6U58QcDi3KPFlyAKcJkLWaoCfQC9CxB9APWUv6fPfYgTo0lJ-NiRxkmt-fga6Fb506W8rUoKvXDh09_aAKd9DOKF2I-MzUxUsMvltGyhA5ii1qp7hzzRYVGVfDGMoObVwUTtc-RENkO2N9aHvGN58ajcVnKwNkW4MuSi7lxbAGthUk_XaCm4AK",
    alt: "Clean abstract render of geometric shapes and mathematical symbols floating in a minimalist white space",
    className: "md:col-span-7",
    browseCategory: "Mathematics",
  },
];

export const trendingSection = {
  heading: "Worth Exploring",
  description: "Timely, high-quality picks with strong topic fit and clear relevance.",
};

export const insightsSection = {
  heading: "Today's Insights",
  description:
    "A higher-signal layer on top of the raw feed, grouping current videos into the core ideas worth learning from today.",
};

export const learningPathsSection = {
  heading: "Learning Paths",
  description:
    "Structured journeys built from live insights so users can move through a topic as a sequence instead of a scattered feed.",
};

export const trendingBrowsePage = {
  heading: "Worth Exploring",
  description: "A curated view of timely, high-quality videos with strong topic relevance.",
};

export const trendingItems: TrendingItem[] = [
  {
    id: "trend-1",
    slug: "room-temperature-superconductors-critical-reevaluation",
    title: "Room Temperature Superconductors: A Critical Re-evalution",
    category: "Physics",
    channel: "Lab Signal",
    publishedAt: "1h ago",
    shortDescription:
      "A sharp reassessment of replication signals, test conditions, and where the superconductivity claim currently stands.",
    thumbnail: "/thumbnails/superconductors.svg",
  },
  {
    id: "trend-2",
    slug: "starship-flight-5-full-mission-breakdown",
    title: "Starship Flight 5: Full Mission Breakdown",
    category: "Physics",
    channel: "Launch Window",
    publishedAt: "3h ago",
    shortDescription:
      "A full systems review of flight sequence, recovery performance, and what the mission implies for heavy-lift progress.",
    thumbnail:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "trend-3",
    slug: "universal-vaccine-for-influenza-new-human-trial-data",
    title: "A Universal Vaccine for Influenza? New Human Trial Data",
    category: "Science",
    channel: "MedBrief",
    publishedAt: "6h ago",
    shortDescription:
      "A concise look at the latest human trial findings and what they mean for broad, long-term flu protection.",
    thumbnail:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "trend-4",
    slug: "the-2024-generative-ai-state-of-play",
    title: "The 2024 Generative AI State of Play",
    category: "AI & Tech",
    channel: "Neural Logic Media",
    publishedAt: "2h ago",
    shortDescription:
      "A top-level read on the model race, deployment realities, and the product bets that are driving AI forward.",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDDWGHzQtOte0EWLwj_da7VZjf9TjfMHax-wZczGmB-nmVpSJmlr37T1Si1Vor9Cdi1E3bqUUYKsP-vjXZlPnGnPemPoMqNcmjZhGB8SEz5-zbSLV2xVsjScnMaD8n_WpvL9etD19bBkXWHKxPigvC9bK8nr_pNUSdlIo0-_C6zX-ICWs677BCbaJsgP1yEXhL5LEGiCWrP9p-GxdOcZQuktzlI6HinGDxUNF4MocpUqd2WOfQEWas7LQ_Xa52rkbpIiNMFQ0bEehIc",
  },
  {
    id: "trend-5",
    slug: "solving-the-riemann-hypothesis",
    title: "Solving the Riemann Hypothesis?",
    category: "Mathematics",
    channel: "Prime Theory",
    publishedAt: "12h ago",
    shortDescription:
      "A compact explanation of why the problem still matters and how recent approaches frame the search for proof.",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQiqGuLJXe9HC3GGdQg3Guszng6qAg1cXz7EevwKwFbhnhJ3U0uyt18z1w5EghjfPt1DdI1zG2A7xYt62Uc4iVwGeWrZNSB0xsP0KqG_v5B7aJcAqMHkPoj7q15P5Nr4xtBDGefjRsM9H6wEeIZUSiOz7RUn9zUJ4W13LbKKTienAkextWg7du_65vjYrF5g2BffyNB4p4OgsuWqAM-6F7jaoVNHPGqn8--V-61dEpRVrDQa_JsPz7dCWTLq5mpwH4-SYL-oLoz6Mz",
  },
];

export const footerContent = {
  brand: "Istitdlal",
  description:
    "A browse-first platform for discovering trusted science and technology videos through cleaner categories, topics, and search.",
  summary: [
    "Trusted sources",
    "Topic-led browsing",
    "Cleaner discovery",
  ],
  columns: [
    {
      heading: "Resources",
      links: [
        { label: "Explore Now", href: "/trending" },
        { label: "Categories", href: "/categories" },
        { label: "Search", href: "/search" },
      ],
    },
      {
        heading: "Project",
        links: [
          { label: "About", href: "/about" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
    copyright: "\u00A9 2026 Istitdlal.",
  };

export function getVideoBySlug(slug: string) {
  return findVideoBySlug(videos, slug);
}

export function getBrowseCategoryForVideo(video: VideoItem): BrowseCategory {
  if (video.primaryCategory) {
    return video.primaryCategory;
  }

  switch (video.category) {
    case "AI & Tech":
      return "AI & Tech";
    case "Mathematics":
      return "Mathematics";
    case "Physics":
    case "Space Science":
    case "Space X":
    case "Materials Science":
      return "Physics";
    case "Biology":
    case "Medicine":
    default:
      return "Science";
  }
}

export function getVideosByBrowseCategory(category: BrowseCategory) {
  return filterVideosByBrowseCategory(videos, category);
}

export function filterVideosByBrowseCategory(items: VideoItem[], category: BrowseCategory) {
  return items.filter((video) => getBrowseCategoryForVideo(video) === category);
}

export function findVideoBySlug(items: VideoItem[], slug: string) {
  return items.find((video) => video.slug === slug);
}

export function searchVideoItems(items: VideoItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return items
    .map((video) => {
      let score = 0;

      const title = video.title.toLowerCase();
      const category = video.category.toLowerCase();
      const channel = video.channel.toLowerCase();
      const description = video.description.toLowerCase();

      if (title.includes(normalizedQuery)) score += title.startsWith(normalizedQuery) ? 12 : 8;
      if (category.includes(normalizedQuery)) score += 5;
      if (channel.includes(normalizedQuery)) score += 4;
      if (description.includes(normalizedQuery)) score += 3;

      return { video, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.video);
}

export function searchVideos(query: string) {
  return searchVideoItems(videos, query);
}

export function getVideoTrustLabel(video: Pick<VideoItem, "trustedSource" | "trustedChannelKey">) {
  return video.trustedSource || video.trustedChannelKey ? "Trusted source" : null;
}

export function getVideoLevelLabel(
  video: Pick<VideoItem, "educationLevel" | "durationSeconds" | "title" | "description">,
) {
  const declaredLevel = video.educationLevel?.toLowerCase();

  if (declaredLevel?.includes("beginner") || declaredLevel?.includes("intro")) {
    return "Beginner";
  }

  if (
    declaredLevel?.includes("advanced") ||
    declaredLevel?.includes("graduate") ||
    /\b(proof|theorem|formal|derivation|deep dive)\b/i.test(`${video.title} ${video.description}`)
  ) {
    return "Advanced";
  }

  if (video.durationSeconds && video.durationSeconds <= 8 * 60) {
    return "Quick start";
  }

  if (video.durationSeconds && video.durationSeconds >= 20 * 60) {
    return "Deep dive";
  }

  return "Guided";
}
