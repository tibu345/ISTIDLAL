import type { CategoryItem, VideoItem, BrowseCategory } from "@/lib/site-data";
import { buildHomepageViewModel } from "@/lib/homepage-shaping";
import { buildLearningPaths } from "@/lib/learning-paths";
import { buildTopicCollections } from "@/lib/topic-collections";
import { buildTrustedLearningSourceSummaries, getTrustedLearningSourcePage } from "@/lib/trusted-learning-sources";
import { buildExploreNowSections } from "@/lib/explore-now";
import { searchEducationalVideos } from "@/lib/video-search";
import { getBrowseCategoryForVideo } from "@/lib/site-data";

type DemoVideo = VideoItem & {
  sourceCue: string;
  summary: string;
  progressionLabel?: string;
  nextStepSlugs: string[];
};

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createThumbnail({
  accent,
  background,
  eyebrow,
  title,
}: {
  accent: string;
  background: string;
  eyebrow: string;
  title: string;
}) {
  const safeTitle = escapeSvgText(title);
  const safeEyebrow = escapeSvgText(eyebrow);

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#07111f" />
        </linearGradient>
        <radialGradient id="glow" cx="0.18" cy="0.12" r="0.9">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.65" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)" />
      <rect width="1200" height="675" fill="url(#glow)" />
      <g opacity="0.22">
        <circle cx="1040" cy="120" r="160" fill="${accent}" />
        <circle cx="180" cy="560" r="200" fill="#ffffff" />
      </g>
      <rect x="74" y="74" width="250" height="42" rx="21" fill="rgba(255,255,255,0.12)" />
      <text x="100" y="101" fill="#e2e8f0" font-family="Georgia, 'Times New Roman', serif" font-size="20" letter-spacing="3">${safeEyebrow}</text>
      <text x="96" y="300" fill="#f8fafc" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="700">${safeTitle}</text>
      <rect x="96" y="352" width="460" height="8" rx="4" fill="${accent}" />
      <rect x="820" y="188" width="244" height="244" rx="48" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" />
      <path d="M900 260h84v100h-84z" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M854 476h176" fill="none" stroke="rgba(255,255,255,0.42)" stroke-width="16" stroke-linecap="round" />
      <path d="M114 525h420" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="12" stroke-linecap="round" />
    </svg>
  `);
}

function createCategoryImage(title: string, accent: string, background: string) {
  const safeTitle = escapeSvgText(title);

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#08121c" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="980" cy="180" r="220" fill="${accent}" opacity="0.34" />
      <circle cx="260" cy="720" r="280" fill="#ffffff" opacity="0.08" />
      <rect x="88" y="88" width="368" height="52" rx="26" fill="rgba(255,255,255,0.10)" />
      <text x="118" y="123" fill="#f8fafc" font-family="Georgia, 'Times New Roman', serif" font-size="24" letter-spacing="5">ISTIDLAL</text>
      <text x="96" y="390" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="112" font-weight="700">${safeTitle}</text>
      <rect x="96" y="438" width="440" height="10" rx="5" fill="${accent}" />
    </svg>
  `);
}

function demoVideo(input: Omit<DemoVideo, "source" | "alt" | "thumbnailWidth" | "thumbnailHeight" | "thumbnail"> & {
  accent: string;
  background: string;
  eyebrow: string;
}) {
  return {
    ...input,
    source: "mock" as const,
    alt: input.title,
    thumbnailWidth: 1200,
    thumbnailHeight: 675,
    thumbnail: createThumbnail({
      accent: input.accent,
      background: input.background,
      eyebrow: input.eyebrow,
      title: input.title.length > 34 ? `${input.title.slice(0, 31)}...` : input.title,
    }),
  };
}

export const demoCategories: CategoryItem[] = [
  {
    title: "AI & Tech",
    description: "Language models, robotics, compute infrastructure, and product systems that shape applied intelligence.",
    image: createCategoryImage("AI & Tech", "#6ee7b7", "#0f3b36"),
    alt: "AI and technology category artwork",
    className: "md:col-span-8",
    browseCategory: "AI & Tech",
  },
  {
    title: "Physics",
    description: "Quantum ideas, physical intuition, and space systems explained with less noise and more context.",
    image: createCategoryImage("Physics", "#93c5fd", "#102743"),
    alt: "Physics category artwork",
    className: "md:col-span-4",
    browseCategory: "Physics",
  },
  {
    title: "Science",
    description: "Biology, medicine, climate, and research stories organized into credible topic lanes.",
    image: createCategoryImage("Science", "#fca5a5", "#3a1919"),
    alt: "Science category artwork",
    className: "md:col-span-5",
    browseCategory: "Science",
  },
  {
    title: "Mathematics",
    description: "Proofs, number theory, and visual reasoning arranged into deterministic-looking paths.",
    image: createCategoryImage("Mathematics", "#fcd34d", "#473210"),
    alt: "Mathematics category artwork",
    className: "md:col-span-7",
    browseCategory: "Mathematics",
  },
];

export const demoVideos: DemoVideo[] = [
  demoVideo({
    id: "ai-llm-intro",
    slug: "intro-to-modern-llms-tokens-context-and-why-they-matter",
    title: "Intro to Modern LLMs: Tokens, Context Windows, and Why They Matter",
    category: "AI & Tech",
    primaryCategory: "AI & Tech",
    categories: ["AI & Tech"],
    channel: "Two Minute Papers",
    trustedChannelKey: "two-minute-papers",
    trustedSource: true,
    sourceCue: "Trusted research digest",
    publishedAt: "Today",
    publishedAtISO: "2026-04-10T08:15:00.000Z",
    duration: "13:42",
    durationSeconds: 822,
    description: "A clear introduction to language model tokens, context windows, transformer behavior, and the practical tradeoffs that decide whether an LLM feels useful or fragile.",
    summary: "Sets the foundation for how current language models process text and why context length changes product behavior.",
    progressionLabel: "Start here",
    nextStepSlugs: [
      "how-retrieval-augmented-generation-actually-works",
      "agent-loops-explained-planning-tools-and-failure-modes",
    ],
    curationScore: 7,
    classificationConfidence: 0.96,
    qualityScore: 8,
    educationLevel: "beginner",
    language: "en",
    tags: ["llm", "language model", "transformer", "context window"],
    keywords: ["llm", "tokens", "context windows", "transformer", "prompting"],
    topics: ["LLMs"],
    accent: "#6ee7b7",
    background: "#0f3b36",
    eyebrow: "LLMS",
  }),
  demoVideo({
    id: "ai-rag",
    slug: "how-retrieval-augmented-generation-actually-works",
    title: "How Retrieval-Augmented Generation Actually Works",
    category: "AI & Tech",
    primaryCategory: "AI & Tech",
    categories: ["AI & Tech"],
    channel: "CrashCourse",
    trustedChannelKey: "crash-course",
    trustedSource: true,
    sourceCue: "Structured explainer",
    publishedAt: "Today",
    publishedAtISO: "2026-04-10T06:30:00.000Z",
    duration: "15:18",
    durationSeconds: 918,
    description: "Walks through retrieval-augmented generation step by step, showing how search, embeddings, prompting, and system design improve factual grounding for language model products.",
    summary: "Explains the most common system design pattern behind grounded LLM answers.",
    progressionLabel: "Core concept",
    nextStepSlugs: [
      "agent-loops-explained-planning-tools-and-failure-modes",
      "evaluating-small-language-models-on-real-workflows",
    ],
    curationScore: 7,
    classificationConfidence: 0.95,
    qualityScore: 7,
    educationLevel: "intro",
    language: "en",
    tags: ["llm", "rag", "search", "embeddings"],
    keywords: ["retrieval augmented generation", "embeddings", "grounding", "language models"],
    topics: ["LLMs"],
    accent: "#86efac",
    background: "#123f39",
    eyebrow: "RAG",
  }),
  demoVideo({
    id: "ai-agents",
    slug: "agent-loops-explained-planning-tools-and-failure-modes",
    title: "Agent Loops Explained: Planning, Tools, and Failure Modes",
    category: "AI & Tech",
    primaryCategory: "AI & Tech",
    categories: ["AI & Tech"],
    channel: "Two Minute Papers",
    trustedChannelKey: "two-minute-papers",
    trustedSource: true,
    sourceCue: "Trusted research digest",
    publishedAt: "Yesterday",
    publishedAtISO: "2026-04-09T16:00:00.000Z",
    duration: "12:04",
    durationSeconds: 724,
    description: "Connects agentic planning loops, tool use, memory, and evaluation so the current excitement around AI agents becomes easier to judge on real workflow constraints.",
    summary: "Shows what makes agent-style systems coherent, and where they still break.",
    progressionLabel: "Example system",
    nextStepSlugs: [
      "evaluating-small-language-models-on-real-workflows",
      "why-gpu-memory-shapes-model-design",
    ],
    curationScore: 8,
    classificationConfidence: 0.95,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["ai agents", "planning", "tools", "llm"],
    keywords: ["agent loops", "planning", "tool use", "language model workflows"],
    topics: ["LLMs"],
    accent: "#a7f3d0",
    background: "#0e2b2a",
    eyebrow: "AGENTS",
  }),
  demoVideo({
    id: "ai-small-models",
    slug: "evaluating-small-language-models-on-real-workflows",
    title: "Evaluating Small Language Models on Real Workflows",
    category: "AI & Tech",
    primaryCategory: "AI & Tech",
    categories: ["AI & Tech"],
    channel: "Two Minute Papers",
    trustedChannelKey: "two-minute-papers",
    trustedSource: true,
    sourceCue: "Trusted research digest",
    publishedAt: "2 days ago",
    publishedAtISO: "2026-04-08T13:20:00.000Z",
    duration: "18:50",
    durationSeconds: 1130,
    description: "Moves past benchmark theater and compares smaller language models on latency, cost, retrieval quality, and multi-step task performance in realistic enterprise workflows.",
    summary: "Adds evaluation discipline after the introductory LLM system concepts.",
    progressionLabel: "Compare approaches",
    nextStepSlugs: [
      "why-gpu-memory-shapes-model-design",
      "robotics-demos-versus-deployed-robots-the-reality-gap",
    ],
    curationScore: 8,
    classificationConfidence: 0.94,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["llm", "evaluation", "benchmarks", "workflow"],
    keywords: ["small language models", "evaluation", "latency", "cost", "workflow"],
    topics: ["LLMs"],
    accent: "#6ee7b7",
    background: "#1b4332",
    eyebrow: "EVAL",
  }),
  demoVideo({
    id: "ai-gpu-memory",
    slug: "why-gpu-memory-shapes-model-design",
    title: "Why GPU Memory Shapes Model Design",
    category: "AI & Tech",
    primaryCategory: "AI & Tech",
    categories: ["AI & Tech"],
    channel: "Practical Engineering",
    trustedChannelKey: "practical-engineering",
    trustedSource: true,
    sourceCue: "Systems and infrastructure",
    publishedAt: "3 days ago",
    publishedAtISO: "2026-04-07T11:05:00.000Z",
    duration: "16:11",
    durationSeconds: 971,
    description: "Explains why GPU memory limits decide model batch sizes, serving architecture, quantization choices, and the real economics behind shipping modern AI products.",
    summary: "Bridges LLM product talk with compute and semiconductor reality.",
    progressionLabel: "Infrastructure layer",
    nextStepSlugs: [
      "evaluating-small-language-models-on-real-workflows",
      "robotics-demos-versus-deployed-robots-the-reality-gap",
    ],
    curationScore: 7,
    classificationConfidence: 0.92,
    qualityScore: 7,
    educationLevel: "intermediate",
    language: "en",
    tags: ["gpu", "compute", "semiconductors", "ai systems"],
    keywords: ["gpu memory", "batch size", "quantization", "serving", "compute"],
    topics: ["Semiconductors"],
    accent: "#34d399",
    background: "#17352d",
    eyebrow: "COMPUTE",
  }),
  demoVideo({
    id: "ai-robotics-gap",
    slug: "robotics-demos-versus-deployed-robots-the-reality-gap",
    title: "Robotics Demos Versus Deployed Robots: The Reality Gap",
    category: "AI & Tech",
    primaryCategory: "AI & Tech",
    categories: ["AI & Tech"],
    channel: "Two Minute Papers",
    trustedChannelKey: "two-minute-papers",
    trustedSource: true,
    sourceCue: "Trusted research digest",
    publishedAt: "4 days ago",
    publishedAtISO: "2026-04-06T10:15:00.000Z",
    duration: "10:54",
    durationSeconds: 654,
    description: "Separates flashy robotics demos from deployment-grade robotics by focusing on perception, manipulation, reliability, and control under messy real-world constraints.",
    summary: "A side lane for robotics inside the broader AI and tech category.",
    progressionLabel: "Worth exploring",
    nextStepSlugs: ["why-gpu-memory-shapes-model-design"],
    curationScore: 6,
    classificationConfidence: 0.9,
    qualityScore: 7,
    educationLevel: "guided",
    language: "en",
    tags: ["robotics", "automation", "perception", "deployment"],
    keywords: ["robotics", "autonomous systems", "manipulation", "perception"],
    topics: ["Robotics"],
    accent: "#10b981",
    background: "#0f2f2a",
    eyebrow: "ROBOTICS",
  }),
  demoVideo({
    id: "physics-qubits",
    slug: "quantum-computing-for-skeptics-qubits-without-the-hype",
    title: "Quantum Computing for Skeptics: Qubits Without the Hype",
    category: "Physics",
    primaryCategory: "Physics",
    categories: ["Physics"],
    channel: "Veritasium",
    trustedChannelKey: "veritasium",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "Today",
    publishedAtISO: "2026-04-10T07:20:00.000Z",
    duration: "20:34",
    durationSeconds: 1234,
    description: "Starts with the physical meaning of qubits, superposition, and measurement so quantum computing can be understood as physics first, not marketing language first.",
    summary: "The clearest entry point into the quantum lane.",
    progressionLabel: "Start here",
    nextStepSlugs: [
      "entanglement-as-a-physical-resource-the-clean-intuition",
      "from-qubits-to-error-correction-why-noise-wins-first",
    ],
    curationScore: 9,
    classificationConfidence: 0.97,
    qualityScore: 9,
    educationLevel: "beginner",
    language: "en",
    tags: ["quantum", "qubits", "measurement", "physics"],
    keywords: ["quantum computing", "qubits", "measurement", "superposition"],
    topics: ["Quantum"],
    accent: "#93c5fd",
    background: "#102743",
    eyebrow: "QUANTUM",
  }),
  demoVideo({
    id: "physics-entanglement",
    slug: "entanglement-as-a-physical-resource-the-clean-intuition",
    title: "Entanglement as a Physical Resource: The Clean Intuition",
    category: "Physics",
    primaryCategory: "Physics",
    categories: ["Physics"],
    channel: "Veritasium",
    trustedChannelKey: "veritasium",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "Yesterday",
    publishedAtISO: "2026-04-09T14:10:00.000Z",
    duration: "17:48",
    durationSeconds: 1068,
    description: "Builds the intuition for entanglement, correlations, and measurement by treating entanglement as a usable physical resource instead of a mysterious slogan.",
    summary: "The core concept step after the qubit introduction.",
    progressionLabel: "Core concept",
    nextStepSlugs: [
      "from-qubits-to-error-correction-why-noise-wins-first",
      "quantum-sensors-and-why-they-beat-classical-limits",
    ],
    curationScore: 9,
    classificationConfidence: 0.96,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["quantum", "entanglement", "measurement", "physics"],
    keywords: ["entanglement", "correlations", "measurement", "quantum resource"],
    topics: ["Quantum"],
    accent: "#bfdbfe",
    background: "#183250",
    eyebrow: "ENTANGLE",
  }),
  demoVideo({
    id: "physics-error-correction",
    slug: "from-qubits-to-error-correction-why-noise-wins-first",
    title: "From Qubits to Error Correction: Why Noise Wins First",
    category: "Physics",
    primaryCategory: "Physics",
    categories: ["Physics"],
    channel: "Veritasium",
    trustedChannelKey: "veritasium",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "2 days ago",
    publishedAtISO: "2026-04-08T09:40:00.000Z",
    duration: "22:09",
    durationSeconds: 1329,
    description: "Explains decoherence, error rates, and why error correction is the gate between impressive qubit demos and reliable quantum computation.",
    summary: "Adds depth by confronting noise, decoherence, and error correction.",
    progressionLabel: "Deeper layer",
    nextStepSlugs: [
      "superconductors-after-the-headlines-what-replication-actually-showed",
      "quantum-sensors-and-why-they-beat-classical-limits",
    ],
    curationScore: 9,
    classificationConfidence: 0.95,
    qualityScore: 9,
    educationLevel: "deep dive",
    language: "en",
    tags: ["quantum", "error correction", "noise", "decoherence"],
    keywords: ["error correction", "decoherence", "quantum noise", "qubits"],
    topics: ["Quantum"],
    accent: "#60a5fa",
    background: "#132f4c",
    eyebrow: "NOISE",
  }),
  demoVideo({
    id: "physics-superconductors",
    slug: "superconductors-after-the-headlines-what-replication-actually-showed",
    title: "Superconductors After the Headlines: What Replication Actually Showed",
    category: "Physics",
    primaryCategory: "Physics",
    categories: ["Physics"],
    channel: "Practical Engineering",
    trustedChannelKey: "practical-engineering",
    trustedSource: true,
    sourceCue: "Systems and infrastructure",
    publishedAt: "2 days ago",
    publishedAtISO: "2026-04-08T06:25:00.000Z",
    duration: "19:27",
    durationSeconds: 1167,
    description: "Revisits superconductors through measurement, replication, materials science, and engineering skepticism so the room-temperature narrative gets replaced with a better physics map.",
    summary: "Connects quantum language with replication discipline and materials reality.",
    progressionLabel: "Case study",
    nextStepSlugs: [
      "quantum-sensors-and-why-they-beat-classical-limits",
      "what-lagrange-points-actually-buy-space-missions",
    ],
    curationScore: 8,
    classificationConfidence: 0.93,
    qualityScore: 8,
    educationLevel: "intermediate",
    language: "en",
    tags: ["quantum", "superconductors", "materials science", "replication"],
    keywords: ["superconductors", "replication", "materials", "quantum claims"],
    topics: ["Quantum"],
    accent: "#7dd3fc",
    background: "#1d3557",
    eyebrow: "MATERIALS",
  }),
  demoVideo({
    id: "physics-sensors",
    slug: "quantum-sensors-and-why-they-beat-classical-limits",
    title: "Quantum Sensors and Why They Beat Classical Limits",
    category: "Physics",
    primaryCategory: "Physics",
    categories: ["Physics"],
    channel: "Veritasium",
    trustedChannelKey: "veritasium",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "3 days ago",
    publishedAtISO: "2026-04-07T13:10:00.000Z",
    duration: "14:58",
    durationSeconds: 898,
    description: "Shows how quantum sensing uses superposition and interference to measure time, motion, and gravity with precision that classical systems struggle to match.",
    summary: "A concrete application step for the quantum collection.",
    progressionLabel: "Real-world application",
    nextStepSlugs: ["what-lagrange-points-actually-buy-space-missions"],
    curationScore: 8,
    classificationConfidence: 0.94,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["quantum", "sensors", "interference", "precision"],
    keywords: ["quantum sensors", "interference", "precision measurement", "gravity"],
    topics: ["Quantum"],
    accent: "#93c5fd",
    background: "#14253d",
    eyebrow: "SENSORS",
  }),
  demoVideo({
    id: "physics-lagrange",
    slug: "what-lagrange-points-actually-buy-space-missions",
    title: "What Lagrange Points Actually Buy Space Missions",
    category: "Physics",
    primaryCategory: "Physics",
    categories: ["Physics"],
    channel: "Practical Engineering",
    trustedChannelKey: "practical-engineering",
    trustedSource: true,
    sourceCue: "Systems and infrastructure",
    publishedAt: "5 days ago",
    publishedAtISO: "2026-04-05T15:00:00.000Z",
    duration: "11:42",
    durationSeconds: 702,
    description: "A compact orbital mechanics explainer on why Lagrange points matter for telescope placement, fuel savings, and long-duration mission design.",
    summary: "An astrophysics and mechanics detour that broadens the physics category.",
    progressionLabel: "Worth exploring",
    nextStepSlugs: ["quantum-sensors-and-why-they-beat-classical-limits"],
    curationScore: 7,
    classificationConfidence: 0.89,
    qualityScore: 7,
    educationLevel: "guided",
    language: "en",
    tags: ["space", "orbital mechanics", "lagrange points", "missions"],
    keywords: ["lagrange points", "orbital mechanics", "space missions", "telescope"],
    topics: ["Astrophysics", "Mechanics"],
    accent: "#60a5fa",
    background: "#101f33",
    eyebrow: "SPACE",
  }),
  demoVideo({
    id: "math-primes",
    slug: "prime-numbers-patterns-and-the-shape-of-number-theory",
    title: "Prime Numbers, Patterns, and the Shape of Number Theory",
    category: "Mathematics",
    primaryCategory: "Mathematics",
    categories: ["Mathematics"],
    channel: "3Blue1Brown",
    trustedChannelKey: "3blue1brown",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "Today",
    publishedAtISO: "2026-04-10T05:55:00.000Z",
    duration: "18:25",
    durationSeconds: 1105,
    description: "A visual introduction to primes, integers, and the core questions that make number theory feel less like trivia and more like structure.",
    summary: "The cleanest on-ramp into the number theory lane.",
    progressionLabel: "Start here",
    nextStepSlugs: [
      "riemann-hypothesis-the-friendly-map-first",
      "why-modular-arithmetic-runs-modern-cryptography",
    ],
    curationScore: 9,
    classificationConfidence: 0.97,
    qualityScore: 9,
    educationLevel: "beginner",
    language: "en",
    tags: ["number theory", "primes", "integers", "math"],
    keywords: ["number theory", "primes", "integers", "patterns"],
    topics: ["Number Theory"],
    accent: "#fcd34d",
    background: "#473210",
    eyebrow: "PRIMES",
  }),
  demoVideo({
    id: "math-riemann",
    slug: "riemann-hypothesis-the-friendly-map-first",
    title: "Riemann Hypothesis: The Friendly Map First",
    category: "Mathematics",
    primaryCategory: "Mathematics",
    categories: ["Mathematics"],
    channel: "3Blue1Brown",
    trustedChannelKey: "3blue1brown",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "Yesterday",
    publishedAtISO: "2026-04-09T12:45:00.000Z",
    duration: "16:33",
    durationSeconds: 993,
    description: "Builds intuition for zeta functions, primes, and why the Riemann Hypothesis matters before leaning on the deeper analytic machinery.",
    summary: "The conceptual bridge between the prime-number intro and deeper analytic ideas.",
    progressionLabel: "Core concept",
    nextStepSlugs: [
      "zeta-functions-and-the-edge-of-analytic-number-theory",
      "why-modular-arithmetic-runs-modern-cryptography",
    ],
    curationScore: 9,
    classificationConfidence: 0.96,
    qualityScore: 9,
    educationLevel: "guided",
    language: "en",
    tags: ["riemann hypothesis", "zeta", "number theory", "primes"],
    keywords: ["riemann hypothesis", "zeta functions", "primes", "analytic number theory"],
    topics: ["Number Theory"],
    accent: "#fde68a",
    background: "#58411a",
    eyebrow: "RIEMANN",
  }),
  demoVideo({
    id: "math-modular",
    slug: "why-modular-arithmetic-runs-modern-cryptography",
    title: "Why Modular Arithmetic Runs Modern Cryptography",
    category: "Mathematics",
    primaryCategory: "Mathematics",
    categories: ["Mathematics"],
    channel: "CrashCourse",
    trustedChannelKey: "crash-course",
    trustedSource: true,
    sourceCue: "Structured explainer",
    publishedAt: "2 days ago",
    publishedAtISO: "2026-04-08T10:10:00.000Z",
    duration: "14:12",
    durationSeconds: 852,
    description: "Turns modular arithmetic into a practical story about integers, congruences, and why modern cryptography leans so heavily on number theory.",
    summary: "Adds a practical example lane to the core number theory topic.",
    progressionLabel: "Applied example",
    nextStepSlugs: [
      "zeta-functions-and-the-edge-of-analytic-number-theory",
      "why-curvature-changes-every-map",
    ],
    curationScore: 8,
    classificationConfidence: 0.94,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["modular arithmetic", "cryptography", "number theory", "integers"],
    keywords: ["modular arithmetic", "congruence", "cryptography", "number theory"],
    topics: ["Number Theory"],
    accent: "#fbbf24",
    background: "#402c10",
    eyebrow: "MODULAR",
  }),
  demoVideo({
    id: "math-zeta",
    slug: "zeta-functions-and-the-edge-of-analytic-number-theory",
    title: "Zeta Functions and the Edge of Analytic Number Theory",
    category: "Mathematics",
    primaryCategory: "Mathematics",
    categories: ["Mathematics"],
    channel: "3Blue1Brown",
    trustedChannelKey: "3blue1brown",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "3 days ago",
    publishedAtISO: "2026-04-07T09:25:00.000Z",
    duration: "24:41",
    durationSeconds: 1481,
    description: "A deeper dive into zeta functions, complex analysis, and the analytic structures that make modern number theory feel both elegant and difficult.",
    summary: "The advanced step in the number theory path.",
    progressionLabel: "Advanced step",
    nextStepSlugs: ["proof-by-invariant-a-technique-you-can-reuse"],
    curationScore: 9,
    classificationConfidence: 0.95,
    qualityScore: 9,
    educationLevel: "advanced",
    language: "en",
    tags: ["zeta", "analytic number theory", "complex analysis", "riemann"],
    keywords: ["zeta functions", "analytic number theory", "complex analysis", "riemann"],
    topics: ["Number Theory"],
    accent: "#f59e0b",
    background: "#4b3512",
    eyebrow: "ZETA",
  }),
  demoVideo({
    id: "math-invariant",
    slug: "proof-by-invariant-a-technique-you-can-reuse",
    title: "Proof by Invariant: A Technique You Can Reuse",
    category: "Mathematics",
    primaryCategory: "Mathematics",
    categories: ["Mathematics"],
    channel: "3Blue1Brown",
    trustedChannelKey: "3blue1brown",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "4 days ago",
    publishedAtISO: "2026-04-06T08:10:00.000Z",
    duration: "12:37",
    durationSeconds: 757,
    description: "A proof-focused logic explainer that introduces invariants as a reusable strategy for mathematical reasoning, elegant proofs, and problem solving.",
    summary: "Extends the mathematics category into logic and proof technique.",
    progressionLabel: "Skill builder",
    nextStepSlugs: ["why-curvature-changes-every-map"],
    curationScore: 7,
    classificationConfidence: 0.9,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["proof", "logic", "invariant", "theorem"],
    keywords: ["proof by invariant", "logic", "theorem", "formal reasoning"],
    topics: ["Logic"],
    accent: "#fcd34d",
    background: "#362714",
    eyebrow: "PROOF",
  }),
  demoVideo({
    id: "math-curvature",
    slug: "why-curvature-changes-every-map",
    title: "Why Curvature Changes Every Map",
    category: "Mathematics",
    primaryCategory: "Mathematics",
    categories: ["Mathematics"],
    channel: "3Blue1Brown",
    trustedChannelKey: "3blue1brown",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "5 days ago",
    publishedAtISO: "2026-04-05T11:15:00.000Z",
    duration: "11:58",
    durationSeconds: 718,
    description: "Uses curvature, geometry, and visual reasoning to show why maps distort space and why geometry remains one of the most intuitive entry points into advanced math.",
    summary: "A geometry detour that keeps the math category feeling broad, not narrow.",
    progressionLabel: "Worth exploring",
    nextStepSlugs: ["proof-by-invariant-a-technique-you-can-reuse"],
    curationScore: 7,
    classificationConfidence: 0.9,
    qualityScore: 8,
    educationLevel: "intro",
    language: "en",
    tags: ["geometry", "curvature", "maps", "visual math"],
    keywords: ["geometry", "curvature", "map projection", "visual reasoning"],
    topics: ["Geometry"],
    accent: "#fde68a",
    background: "#4f3515",
    eyebrow: "GEOMETRY",
  }),
  demoVideo({
    id: "science-mrna",
    slug: "how-mrna-vaccines-train-the-immune-system",
    title: "How mRNA Vaccines Train the Immune System",
    category: "Medicine",
    primaryCategory: "Science",
    categories: ["Science"],
    channel: "Kurzgesagt",
    trustedChannelKey: "kurzgesagt",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "Today",
    publishedAtISO: "2026-04-10T04:50:00.000Z",
    duration: "14:26",
    durationSeconds: 866,
    description: "A structured introduction to mRNA vaccines, immune memory, and why the body can be taught to recognize a pathogen without exposing it to the disease itself.",
    summary: "The most accessible entry point into the medicine lane.",
    progressionLabel: "Start here",
    nextStepSlugs: [
      "crispr-as-a-therapy-start-with-the-delivery-problem",
      "inside-a-phase-ii-trial-reading-early-clinical-signals",
    ],
    curationScore: 8,
    classificationConfidence: 0.96,
    qualityScore: 8,
    educationLevel: "beginner",
    language: "en",
    tags: ["medicine", "mRNA", "immune system", "vaccine"],
    keywords: ["mRNA vaccine", "immune system", "medicine", "immune memory"],
    topics: ["Medicine"],
    accent: "#fca5a5",
    background: "#3a1919",
    eyebrow: "IMMUNE",
  }),
  demoVideo({
    id: "science-crispr",
    slug: "crispr-as-a-therapy-start-with-the-delivery-problem",
    title: "CRISPR as a Therapy: Start with the Delivery Problem",
    category: "Biology",
    primaryCategory: "Science",
    categories: ["Science"],
    channel: "SciShow",
    trustedChannelKey: "scishow",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "Yesterday",
    publishedAtISO: "2026-04-09T10:35:00.000Z",
    duration: "13:31",
    durationSeconds: 811,
    description: "Explains why CRISPR therapy is not only about editing genes, but also about the biology, delivery, targeting, and safety constraints that decide whether medicine can actually reach patients.",
    summary: "Moves from broad immune-system framing into modern therapeutic biology.",
    progressionLabel: "Core concept",
    nextStepSlugs: [
      "inside-a-phase-ii-trial-reading-early-clinical-signals",
      "antibiotic-resistance-in-plain-language",
    ],
    curationScore: 8,
    classificationConfidence: 0.95,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["crispr", "biology", "therapy", "medicine"],
    keywords: ["crispr therapy", "gene editing", "delivery problem", "medicine"],
    topics: ["Medicine", "Biology"],
    accent: "#fda4af",
    background: "#4b1d24",
    eyebrow: "CRISPR",
  }),
  demoVideo({
    id: "science-trial",
    slug: "inside-a-phase-ii-trial-reading-early-clinical-signals",
    title: "Inside a Phase II Trial: Reading Early Clinical Signals",
    category: "Medicine",
    primaryCategory: "Science",
    categories: ["Science"],
    channel: "Osmosis from Elsevier",
    trustedChannelKey: "osmosis",
    trustedSource: true,
    sourceCue: "Clinically grounded source",
    publishedAt: "2 days ago",
    publishedAtISO: "2026-04-08T15:30:00.000Z",
    duration: "17:12",
    durationSeconds: 1032,
    description: "A medicine-focused explainer on what Phase II clinical trial results actually tell us about efficacy, safety, signal quality, and whether a therapy has a realistic path forward.",
    summary: "Introduces clinical reasoning after the biology fundamentals.",
    progressionLabel: "Interpret evidence",
    nextStepSlugs: [
      "antibiotic-resistance-in-plain-language",
      "the-microbiome-hype-cycle-carefully-explained",
    ],
    curationScore: 9,
    classificationConfidence: 0.95,
    qualityScore: 9,
    educationLevel: "intermediate",
    language: "en",
    tags: ["medicine", "clinical trial", "phase ii", "evidence"],
    keywords: ["phase ii trial", "clinical signals", "safety", "efficacy", "medicine"],
    topics: ["Medicine"],
    accent: "#fb7185",
    background: "#431c2b",
    eyebrow: "TRIALS",
  }),
  demoVideo({
    id: "science-antibiotics",
    slug: "antibiotic-resistance-in-plain-language",
    title: "Antibiotic Resistance in Plain Language",
    category: "Medicine",
    primaryCategory: "Science",
    categories: ["Science"],
    channel: "SciShow",
    trustedChannelKey: "scishow",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "3 days ago",
    publishedAtISO: "2026-04-07T12:05:00.000Z",
    duration: "12:44",
    durationSeconds: 764,
    description: "Connects bacteria, selection pressure, treatment decisions, and public health so antibiotic resistance can be understood as an evolving biological system, not only a scary headline.",
    summary: "A strong medicine follow-up with direct relevance and clear biological reasoning.",
    progressionLabel: "Public health example",
    nextStepSlugs: [
      "the-microbiome-hype-cycle-carefully-explained",
      "carbon-removal-scale-and-the-energy-reality",
    ],
    curationScore: 8,
    classificationConfidence: 0.94,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["medicine", "bacteria", "antibiotic resistance", "public health"],
    keywords: ["antibiotic resistance", "bacteria", "selection pressure", "medicine"],
    topics: ["Medicine", "Biology"],
    accent: "#fca5a5",
    background: "#3f1d27",
    eyebrow: "BACTERIA",
  }),
  demoVideo({
    id: "science-microbiome",
    slug: "the-microbiome-hype-cycle-carefully-explained",
    title: "The Microbiome Hype Cycle, Carefully Explained",
    category: "Biology",
    primaryCategory: "Science",
    categories: ["Science"],
    channel: "Kurzgesagt",
    trustedChannelKey: "kurzgesagt",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "4 days ago",
    publishedAtISO: "2026-04-06T14:40:00.000Z",
    duration: "11:39",
    durationSeconds: 699,
    description: "Separates what microbiome research genuinely suggests from what product marketing and overstated biology claims tend to promise too quickly.",
    summary: "Keeps the science category honest by emphasizing evidence quality.",
    progressionLabel: "Evidence check",
    nextStepSlugs: ["carbon-removal-scale-and-the-energy-reality"],
    curationScore: 7,
    classificationConfidence: 0.92,
    qualityScore: 8,
    educationLevel: "guided",
    language: "en",
    tags: ["biology", "microbiome", "research", "evidence"],
    keywords: ["microbiome", "biology", "evidence quality", "research"],
    topics: ["Biology"],
    accent: "#f87171",
    background: "#44232d",
    eyebrow: "BIOLOGY",
  }),
  demoVideo({
    id: "science-carbon",
    slug: "carbon-removal-scale-and-the-energy-reality",
    title: "Carbon Removal, Scale, and the Energy Reality",
    category: "Climate",
    primaryCategory: "Science",
    categories: ["Science"],
    channel: "MinuteEarth",
    trustedChannelKey: "minute-earth",
    trustedSource: true,
    sourceCue: "Trusted source",
    publishedAt: "5 days ago",
    publishedAtISO: "2026-04-05T09:20:00.000Z",
    duration: "10:22",
    durationSeconds: 622,
    description: "A climate systems explainer on carbon removal, energy demand, and why scale matters more than slogans when environmental technology is evaluated seriously.",
    summary: "Adds climate coverage without breaking the science-first tone.",
    progressionLabel: "Worth exploring",
    nextStepSlugs: ["antibiotic-resistance-in-plain-language"],
    curationScore: 7,
    classificationConfidence: 0.9,
    qualityScore: 7,
    educationLevel: "guided",
    language: "en",
    tags: ["climate", "carbon removal", "energy", "environment"],
    keywords: ["carbon removal", "climate", "energy demand", "environment"],
    topics: ["Climate"],
    accent: "#fb7185",
    background: "#4a2323",
    eyebrow: "CLIMATE",
  }),
];

export function getDemoVideos() {
  return demoVideos;
}

export function getDemoCategories() {
  return demoCategories;
}

export function getDemoCollections() {
  return buildTopicCollections(demoVideos, 12);
}

export function getDemoCollectionSlugs() {
  return getDemoCollections().map((collection) => collection.slug);
}

export function getDemoVideoBySlug(slug: string) {
  return demoVideos.find((video) => video.slug === slug) ?? null;
}

export function getDemoVideoSlugs() {
  return demoVideos.map((video) => video.slug);
}

export function getDemoHomepageData() {
  const { topicCollections, homepageTrendingItems } = buildHomepageViewModel(demoVideos);

  return {
    videos: demoVideos,
    categories: demoCategories,
    topicCollections,
    homepageTrendingItems,
  };
}

export function getDemoExploreNowSections() {
  return buildExploreNowSections(demoVideos).map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    category: section.category,
    items: section.items.map((entry) => ({
      id: `${section.id}-${entry.video.slug}`,
      slug: entry.video.slug,
      label: entry.label,
      reason: entry.reason,
      title: entry.video.title,
      category: getBrowseCategoryForVideo(entry.video),
      channel: entry.video.channel,
      publishedAt: entry.video.publishedAt,
      shortDescription: (entry.video as DemoVideo).summary ?? entry.video.description,
      thumbnail: entry.video.thumbnail,
      youtubeVideoId: entry.video.youtubeVideoId,
      thumbnailWidth: entry.video.thumbnailWidth,
      thumbnailHeight: entry.video.thumbnailHeight,
      isShortForm: entry.video.isShortForm,
      topics: entry.video.topics?.slice(0, 2),
    })),
  }));
}

export function getDemoSearchResponse(
  query: string,
  options?: {
    category?: BrowseCategory | null;
    topic?: string | null;
  },
) {
  return searchEducationalVideos(demoVideos, {
    query,
    category: options?.category,
    topic: options?.topic,
  });
}

export function getDemoLearningPaths(category?: BrowseCategory | null) {
  return buildLearningPaths(demoVideos, {
    category: category ?? undefined,
    maxPaths: category ? 6 : 12,
  });
}

export function getDemoSourceSummaries(category?: BrowseCategory | null) {
  return buildTrustedLearningSourceSummaries(demoVideos, {
    category,
    limit: 12,
  });
}

export function getDemoSourcePage(key: string) {
  return getTrustedLearningSourcePage(demoVideos, key);
}

export function getDemoSourceKeys() {
  return getDemoSourceSummaries().map((source) => source.key);
}
