"use client";

import React, { useState } from "react";
import { RAGContext, TrendItem } from "@/lib/types";
import { Database, ShieldCheck, Sparkles, CheckCircle2, Link2, BarChart2, Layers, Search, ArrowRight } from "lucide-react";

interface RAGEvidenceViewerProps {
  trend: TrendItem | null;
  ragContext: RAGContext | null;
  isLoading: boolean;
  onRunCustomQuery: (query: string) => void;
  onProceedToStudio: () => void;
  onProceedToContextEngine?: () => void;
}

export const RAGEvidenceViewer: React.FC<RAGEvidenceViewerProps> = ({
  trend,
  ragContext,
  isLoading,
  onRunCustomQuery,
  onProceedToStudio,
  onProceedToContextEngine,
}) => {
  const [customQuery, setCustomQuery] = useState("");

  if (!trend && !ragContext) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
        <Database className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 text-base font-semibold text-white">No Trend Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Please select a trending topic from Stage 1 to extract semantic chunks and build RAG evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
              <Database className="h-4 w-4" />
              <span>STAGE 2: VECTOR RAG EVIDENCE RETRIEVAL</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {trend?.topic || "Semantic Knowledge Index"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Source text has been parsed into vector-indexed semantic chunks. Cosine similarity calculates relevance scores and extracts verifiable facts for LLM generation.
            </p>
          </div>

          {/* Grounding Score Card */}
          {ragContext && (
            <div className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-3 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Grounding Confidence
                </div>
                <div className="text-2xl font-black text-white">
                  {ragContext.groundingScore}%
                  <span className="ml-2 text-xs font-normal text-slate-400">Verifiable Facts</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom RAG Query Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2 border-t border-slate-800/80 pt-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Refine retrieval query (e.g. 'enterprise adoption rate', 'memory latency benchmark')..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customQuery.trim()) {
                  onRunCustomQuery(customQuery.trim());
                }
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={() => customQuery.trim() && onRunCustomQuery(customQuery.trim())}
            disabled={isLoading || !customQuery.trim()}
            className="w-full sm:w-auto rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-4 py-2 text-xs font-semibold text-white transition-all"
          >
            {isLoading ? "Re-Indexing..." : "Re-Query RAG"}
          </button>
        </div>
      </div>

      {/* Chunks & Evidence Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Retrieved Evidence Chunks */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="h-4 w-4 text-orange-400" />
              Retrieved Semantic Evidence Chunks ({ragContext?.evidence.length || 0})
            </h3>
            <span className="text-[11px] text-slate-400">Indexed via Vector Cosine Similarity</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse p-4" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {ragContext?.evidence.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/90"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-500/20 text-[10px] font-bold text-orange-400">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-sm">
                        {chunk.sourceTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                        Similarity: {(chunk.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Chunk Text */}
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 font-serif">
                    &ldquo;{chunk.chunkText}&rdquo;
                  </p>

                  {/* Extracted Stats / Entities */}
                  {chunk.keyStats.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-medium">Extracted Data Points:</span>
                      {chunk.keyStats.map((stat, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-300"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Source Reference Link */}
                  <div className="mt-2 flex items-center justify-end">
                    <a
                      href={chunk.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-orange-400 transition-colors"
                    >
                      <Link2 className="h-3 w-3" />
                      <span>{chunk.sourceUrl}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Summary & Next Stage Callout */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
              <BarChart2 className="h-4 w-4 text-orange-400" />
              RAG Pipeline Summary
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Chunks Extracted:</span>
                <span className="font-semibold text-white">{ragContext?.evidence.length || 0}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Retriever Model:</span>
                <span className="font-semibold text-orange-400">In-Memory Cosine Vector</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Citation Traceability:</span>
                <span className="font-semibold text-emerald-400">100% Verified URLs</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Swytchcode Authority:</span>
                <span className="font-semibold text-emerald-400">Active Audit Mode</span>
              </div>
            </div>

            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-3 text-xs text-orange-200/90 leading-relaxed">
              <p className="font-medium text-orange-300 mb-1">Ready for Grounded Generation:</p>
              Gemini LLM will synthesize these exact verified evidence chunks into platform-tailored drafts with direct source citations.
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onProceedToStudio}
                disabled={isLoading || !ragContext}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Generate Multi-Platform Content
                <ArrowRight className="h-4 w-4" />
              </button>

              {onProceedToContextEngine && (
                <button
                  onClick={onProceedToContextEngine}
                  disabled={isLoading || !ragContext}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/15 hover:bg-orange-500/25 py-2.5 text-xs font-bold text-orange-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  Repurpose in Context Engine (1→Many)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
