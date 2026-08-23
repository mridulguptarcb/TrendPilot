"use client";

import React, { useState } from "react";
import { TrendItem } from "@/lib/types";
import {
  Flame,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Filter,
  Search,
  Github,
  Globe,
  Plus,
  ShieldCheck,
  Check,
  Layers,
} from "lucide-react";

interface TrendDiscoveryProps {
  trends: TrendItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTrend: (trend: TrendItem) => void;
  selectedTrendId?: string;
  onRepurposeInContextEngine?: (trend: TrendItem) => void;
}

export const TrendDiscovery: React.FC<TrendDiscoveryProps> = ({
  trends,
  isLoading,
  onRefresh,
  onSelectTrend,
  selectedTrendId,
  onRepurposeInContextEngine,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Direct URL Ingestion State
  const [customUrl, setCustomUrl] = useState<string>("");
  const [isIngestingUrl, setIsIngestingUrl] = useState<boolean>(false);
  const [urlIngestStatus, setUrlIngestStatus] = useState<string | null>(null);
  const [customIngestedTrends, setCustomIngestedTrends] = useState<TrendItem[]>([]);

  const categories = ["All", "AI & ML", "Tech & Dev", "Cloud & Infra", "Startup & Business"];
  const sources = [
    { label: "All Sources", value: "All" },
    { label: "🔥 Hacker News", value: "Hacker News" },
    { label: "🐙 GitHub Trending", value: "GitHub" },
    { label: "🤖 Reddit Communities", value: "Reddit" },
    { label: "📰 Tech News", value: "Tech" },
  ];

  // Combine parent trends with user-ingested custom trends
  const allTrends = [...customIngestedTrends, ...trends];

  const filteredTrends = allTrends.filter((trend) => {
    const matchesCategory = selectedCategory === "All" || trend.category === selectedCategory;
    const matchesSource =
      selectedSource === "All" ||
      (selectedSource === "GitHub" && trend.source.toLowerCase().includes("github")) ||
      (selectedSource === "Reddit" && trend.source.toLowerCase().includes("reddit")) ||
      (selectedSource === "Hacker News" && trend.source.toLowerCase().includes("hacker news")) ||
      (selectedSource === "Tech" &&
        (trend.source.toLowerCase().includes("techcrunch") ||
          trend.source.toLowerCase().includes("dev.to") ||
          trend.source.toLowerCase().includes("saas")));

    const matchesSearch =
      trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.topic.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSource && matchesSearch;
  });

  // Direct Ingest via Swytchcode URL Fetcher
  const handleIngestCustomUrl = async () => {
    if (!customUrl.trim()) return;
    setIsIngestingUrl(true);
    setUrlIngestStatus("Fetching & extracting via Swytchcode Authority...");

    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "url", url: customUrl.trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newTrend: TrendItem = {
          id: `custom_ingest_${Date.now()}`,
          title: json.data.title || customUrl,
          topic: json.data.title?.split(" - ")[0]?.slice(0, 50) || "Ingested Web Context",
          source: "Swytchcode Direct Web Ingestion",
          url: customUrl.trim(),
          summary: (json.data.extractedText || json.data.title).slice(0, 240) + "...",
          publishedAt: new Date().toISOString(),
          category: "Tech & Dev",
          score: 95,
          rawText: json.data.extractedText || json.data.title,
        };

        setCustomIngestedTrends((prev) => [newTrend, ...prev]);
        setUrlIngestStatus("Ingested successfully! Added to trend list.");
        setCustomUrl("");
        setTimeout(() => setUrlIngestStatus(null), 3000);
      } else {
        setUrlIngestStatus(`Failed: ${json.error || "Could not fetch URL"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUrlIngestStatus(`Error: ${msg}`);
    } finally {
      setIsIngestingUrl(false);
    }
  };

  const getSourceBadge = (source: string) => {
    if (source.toLowerCase().includes("github")) {
      return (
        <span className="flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
          <Github className="h-3 w-3" />
          GitHub Trending
        </span>
      );
    }
    if (source.toLowerCase().includes("reddit")) {
      return (
        <span className="flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-400">
          <Globe className="h-3 w-3" />
          {source}
        </span>
      );
    }
    if (source.toLowerCase().includes("hacker news")) {
      return (
        <span className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
          <Flame className="h-3 w-3" />
          Hacker News
        </span>
      );
    }
    return (
      <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
        {source}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
            <Flame className="h-4 w-4" />
            <span>STAGE 1: MULTI-SOURCE TREND & COMMUNITY INGESTION</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Live AI & Tech Trend Radar</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Continuously polling live <strong>Hacker News</strong>, <strong>GitHub Trending</strong>, <strong>Reddit Communities</strong> (r/MachineLearning, r/LocalLLaMA), and TechCrunch. Select any trend to extract RAG evidence or repurpose across all platforms.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Fetching Feeds..." : "Refresh Multi-Source Feeds"}
        </button>
      </div>

      {/* Swytchcode Direct URL Ingestion Bar */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Direct Web Ingest via Swytchcode Authority</span>
          </div>
          {urlIngestStatus && (
            <span className="text-[11px] font-mono text-emerald-300 animate-pulse">
              {urlIngestStatus}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="url"
            placeholder="Paste any article URL, documentation link, or GitHub repo URL to ingest directly..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleIngestCustomUrl()}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
          />
          <button
            onClick={handleIngestCustomUrl}
            disabled={isIngestingUrl || !customUrl.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 text-xs font-bold text-slate-950 shrink-0 shadow transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            {isIngestingUrl ? "Ingesting..." : "Ingest URL via Swytchcode"}
          </button>
        </div>
      </div>

      {/* Source & Category Filter Tabs */}
      <div className="flex flex-col gap-3 space-y-2">
        {/* Source Pills (GitHub, Reddit, HN, etc.) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold mr-1">Source:</span>
          {sources.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedSource(s.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedSource === s.value
                  ? "bg-orange-500 text-white font-semibold shadow"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category Filter and Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold mr-1">Topic:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-200 text-slate-950 font-semibold shadow"
                    : "bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search trend, repo, or subreddit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrends.map((trend) => {
          const isSelected = trend.id === selectedTrendId;
          return (
            <div
              key={trend.id}
              className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
                isSelected
                  ? "border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getSourceBadge(trend.source)}
                    <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                      {trend.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Score: <strong className="text-orange-400">{trend.score || 92}</strong></span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                  {trend.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {trend.summary}
                </p>

                {/* Source & Link */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                  <span className="truncate max-w-[180px] font-mono">{trend.source}</span>
                  <a
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    <span>View Source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 space-y-2">
                <button
                  onClick={() => onSelectTrend(trend)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-800/80 text-slate-200 hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isSelected ? "Selected for RAG Evidence" : "Extract Evidence & RAG"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {onRepurposeInContextEngine && (
                  <button
                    onClick={() => onRepurposeInContextEngine(trend)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 py-1.5 text-[11px] font-medium text-orange-300 transition-all"
                  >
                    <span>⚡ Repurpose in Context Engine (1→Many)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTrends.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
          <Filter className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-2 text-sm text-slate-400">No trends found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

