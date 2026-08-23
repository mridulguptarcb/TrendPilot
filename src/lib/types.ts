export type PlatformType = "twitter" | "linkedin" | "newsletter" | "blog";

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
