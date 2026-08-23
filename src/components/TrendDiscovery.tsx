"use client";

import React, { useState } from "react";
import { TrendItem } from "@/lib/types";
import { Flame, RefreshCw, ArrowRight, ExternalLink, Sparkles, Filter, Search } from "lucide-react";

interface TrendDiscoveryProps {
  trends: TrendItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTrend: (trend: TrendItem) => void;
  selectedTrendId?: string;
}

export const TrendDiscovery: React.FC<TrendDiscoveryProps> = ({
  trends,
  isLoading,
  onRefresh,
  onSelectTrend,
  selectedTrendId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "AI & ML", "Tech & Dev", "Cloud & Infra", "Startup & Business"];

  const filteredTrends = trends.filter((trend) => {
    const matchesCategory = selectedCategory === "All" || trend.category === selectedCategory;
    const matchesSearch =
      trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
            <Flame className="h-4 w-4" />
            <span>STAGE 1: REAL-TIME TREND INGESTION</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Live Tech & AI Trend Radar</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Continuously polling live Hacker News, TechCrunch RSS feeds, and breaking research papers. Select any trending topic to trigger semantic RAG evidence extraction.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Fetching RSS..." : "Refresh Trends"}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-slate-100 text-slate-950 font-semibold shadow"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
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
            placeholder="Search trend or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
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
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                    {trend.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Viral Score: <strong className="text-orange-400">{trend.score || 92}</strong></span>
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

              {/* Action Button */}
              <div className="mt-5 pt-3">
                <button
                  onClick={() => onSelectTrend(trend)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-800/80 text-slate-200 hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isSelected ? "Selected for RAG Evidence" : "Extract Evidence & RAG"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTrends.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
          <Filter className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-2 text-sm text-slate-400">No trends found matching your search.</p>
        </div>
      )}
    </div>
  );
};
