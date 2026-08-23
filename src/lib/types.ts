export type PlatformType = "twitter" | "linkedin" | "newsletter" | "blog" | "discord" | "telegram";

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHING" | "PUBLISHED" | "FAILED";

export interface TrendItem {
  id: string;
  title: string;
  topic: string;
  source: string;
  url: string;
  summary: string;
  publishedAt: string;
  category: "AI & ML" | "Tech & Dev" | "Cloud & Infra" | "Crypto & Web3" | "Startup & Business";
  score?: number;
  rawText?: string;
}

export interface EvidenceChunk {
  id: string;
  trendId: string;
  sourceTitle: string;
  sourceUrl: string;
  chunkText: string;
  keyStats: string[];
  relevanceScore: number;
}

export interface RAGContext {
  topic: string;
  query: string;
  evidence: EvidenceChunk[];
  groundingScore: number;
  retrievedAt: string;
}

export interface GeneratedContent {
  id: string;
  trendId: string;
  topic: string;
  headline: string;
  audience: "Tech Enthusiasts" | "Founders & Executives" | "Developers" | "General Public";
  tone: "Insightful & Analytical" | "Engaging & Viral" | "Authoritative & Formal" | "Provocative & Bold";
  posts: {
    twitter: {
      thread: string[];
      hashtags: string[];
      citations: string[];
    };
    linkedin: {
      post: string;
      takeaways: string[];
      citations: string[];
    };
    newsletter: {
      subject: string;
      previewText: string;
      bodyMarkdown: string;
      citations: string[];
    };
  };
  groundingScore: number;
  evidenceUsed: string[];
  generatedAt: string;
  swytchcodeExecutionId?: string;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  topic: string;
  platform: PlatformType;
  contentPreview: string;
  fullContent: string | string[];
  scheduledTime: string;
  status: PostStatus;
  publishedAt?: string;
  simulatedUrl?: string;
  trackableUrl?: string;
  realDelivery?: {
    httpStatus: number;
    destination: string;
    payloadSizeBytes: number;
    latencyMs: number;
    dispatchedAt: string;
  };
  realEngagement?: {
    clicks: number;
    lastClickTimestamp?: string;
    uniqueReferrers?: string[];
    wordCount: number;
    charCount: number;
    verifiedCitationsCount: number;
  };
  metrics?: {
    impressions: number;
    likes: number;
    reposts: number;
    clicks: number;
    engagementRate: number;
  };
}

export interface SwytchcodeAuditEntry {
  executionId: string;
  timestamp: string;
  tool: string;
  outcome: "success" | "failure" | "simulated";
  durationMs: number;
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// CONTEXT ENGINE TYPES: One Core Idea -> Many Platform-Ready Formats
// ---------------------------------------------------------------------------

export type FormatType = "video" | "thread" | "caption" | "blog";

export type CoreContextSourceType = "trend" | "rag" | "article" | "manual" | "studio";

export interface BrandProfile {
  id?: string;
  name: string;
  tone: string;
  personality: string;
  vocabulary: string;
  preferredWords: string[];
  avoidedWords: string[];
  targetAudience: string;
  defaultCta: string;
}

export const DEFAULT_BRAND_PROFILES: BrandProfile[] = [
  {
    id: "brand_founder_startup",
    name: "Startup Founder & Product Leader",
    tone: "Insightful & Pragmatic",
    personality: "Technical innovator, builder, focused on ROI and real-world adoption",
    vocabulary: "Actionable, crisp, data-backed, visionary yet grounded",
    preferredWords: ["high-leverage", "production-ready", "deterministic", "ROI", "benchmark", "efficiency"],
    avoidedWords: ["delve", "tapestry", "in conclusion", "revolutionary", "game-changer", "synergy"],
    targetAudience: "Startup Founders & Product Leaders",
    defaultCta: "What is your team testing in production this quarter? Drop your thoughts below.",
  },
  {
    id: "brand_tech_advocate",
    name: "Developer Advocate & Architect",
    tone: "Authoritative & Analytical",
    personality: "Deeply technical, evidence-driven, pragmatic engineer",
    vocabulary: "Precise, code-centric, performance-focused, latency-aware",
    preferredWords: ["throughput", "sub-millisecond", "verifiable", "architecture", "guardrails", "zero-overhead"],
    avoidedWords: ["magic", "easy button", "paradigm shift", "disrupt", "unlock"],
    targetAudience: "Software Developers & Architects",
    defaultCta: "Check the benchmarks and drop your architecture feedback below.",
  },
  {
    id: "brand_viral_creator",
    name: "Tech Creator & Growth Lead",
    tone: "Engaging & Viral",
    personality: "High energy, punchy, curiosity-driven, accessible to everyone",
    vocabulary: "Conversational, vivid, relatable, fast-paced",
    preferredWords: ["the real reason", "here is what changed", "breakdown", "step-by-step", "key takeaway"],
    avoidedWords: ["furthermore", "henceforth", "it is worth noting", "in accordance with"],
    targetAudience: "General Tech Community & Enthusiasts",
    defaultCta: "Save this post for later and follow for daily AI breakdowns.",
  },
  {
    id: "brand_enterprise_analyst",
    name: "Enterprise Strategy & Tech Analyst",
    tone: "Authoritative & Formal",
    personality: "Executive advisor, risk-conscious, strategic, metrics-focused",
    vocabulary: "Executive summary, strategic implications, governance, compliance",
    preferredWords: ["governance", "compliance", "measurable ROI", "auditability", "risk mitigation"],
    avoidedWords: ["mind-blowing", "crazy", "hype", "vibes"],
    targetAudience: "Enterprise Executives & Decision Makers",
    defaultCta: "Download the complete briefing or request an architectural review.",
  },
];

export interface CoreContextInput {
  sourceType: CoreContextSourceType;
  rawContent: string;
  topic?: string;
  trendId?: string;
  evidenceChunks?: EvidenceChunk[];
  sourceUrl?: string;
}

export interface ContentBlueprint {
  id: string;
  coreTopic: string;
  coreMessage: string;
  keyPoints: string[];
  importantFacts: string[];
  evidenceContext: string[];
  citations: { title: string; url: string }[];
  targetAudience: string;
  tone: string;
  brandVoice: BrandProfile;
  cta: string;
  platformConstraints?: Record<string, string>;
  createdAt: string;
  swytchcodeExecutionId?: string;
}

export interface VideoScriptFormat {
  hook: string;
  visualCues: string[];
  spokenBody: string[];
  cta: string;
  estimatedDuration: string;
  keyPointsCovered: string[];
}

export interface ThreadFormat {
  openingPost: string;
  sequentialPosts: string[];
  closingPost: string;
  fullThread: string[];
  hashtags: string[];
}

export interface SocialCaptionFormat {
  openingLine: string;
  coreMessage: string;
  keyTakeaways: string[];
  cta: string;
  hashtags: string[];
  fullText: string;
}

export interface BlogSnippetFormat {
  headline: string;
  introParagraph: string;
  keyInsight: string;
  analysisSection: string;
  conclusion: string;
  cta: string;
  markdown: string;
}

export interface RepurposedFormatSet {
  videoScript?: VideoScriptFormat;
  thread?: ThreadFormat;
  socialCaption?: SocialCaptionFormat;
  blogSnippet?: BlogSnippetFormat;
  generatedAt: string;
  swytchcodeExecutionId?: string;
}

export interface ConsistencyValidation {
  brandConsistencyScore: number;
  contextAlignmentScore: number;
  coreClaimPreserved: boolean;
  factsGroundingPreserved: boolean;
  toneMatched: boolean;
  platformAdaptationScore: number;
  analysisNotes: string[];
  checkedAt: string;
}

