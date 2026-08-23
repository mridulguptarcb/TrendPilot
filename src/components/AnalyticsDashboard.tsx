"use client";

import React from "react";
import { ScheduledPost } from "@/lib/types";
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  ShieldCheck,
  Twitter,
  Linkedin,
  Mail,
  Award
} from "lucide-react";

interface AnalyticsDashboardProps {
  queue: ScheduledPost[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ queue }) => {
  const publishedPosts = queue.filter((p) => p.status === "PUBLISHED");

  const totalImpressions = publishedPosts.reduce(
    (acc, p) => acc + (p.metrics?.impressions || 0),
    0
  );
  const totalLikes = publishedPosts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0);
  const totalClicks = publishedPosts.reduce((acc, p) => acc + (p.metrics?.clicks || 0), 0);
  const avgEngagement =
    publishedPosts.length > 0
      ? (
          publishedPosts.reduce((acc, p) => acc + (p.metrics?.engagementRate || 0), 0) /
          publishedPosts.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-6 shadow-xl">
        <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
          <BarChart3 className="h-4 w-4" />
          <span>STAGE 5: REAL-TIME SIMULATED ANALYTICS</span>
        </div>
        <h2 className="text-2xl font-bold text-white mt-1">Content Reach & Performance Metrics</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Track cross-platform audience engagement, verified citation accuracy, and synthetic performance benchmarks across all published items.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Reach */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Impressions</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalImpressions.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+34.2% vs ungrounded baseline</span>
          </div>
        </div>

        {/* Total Interactions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Engagements</span>
            <Award className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalLikes.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>High audience retention</span>
          </div>
        </div>

        {/* Average Engagement Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Engagement Rate</span>
            <MousePointerClick className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{avgEngagement}%</div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Industry avg: 1.8%</span>
          </div>
        </div>

        {/* Citation Credibility Score */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Grounding Verifiability</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">97.8%</div>
          <div className="text-[11px] text-emerald-300 font-medium">
            Verified RAG source links
          </div>
        </div>
      </div>

      {/* Published Items Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <h3 className="text-sm font-semibold text-white">Published Content Performance Log</h3>
        </div>

        {publishedPosts.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-slate-600" />
            <h4 className="mt-3 text-sm font-semibold text-white">No Published Posts Yet</h4>
            <p className="mt-1 text-xs text-slate-400">
              Publish or simulate posts in the Publishing Queue (Stage 4) to populate live analytics.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {publishedPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-900/90 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                      {post.platform}
                    </span>
                    <span className="text-xs font-semibold text-white">{post.topic}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{post.contentPreview}</p>
                </div>

                <div className="flex items-center gap-6 text-xs shrink-0">
                  <div>
                    <div className="text-[10px] text-slate-500">Impressions</div>
                    <div className="font-semibold text-white">
                      {post.metrics?.impressions.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Likes / Reposts</div>
                    <div className="font-semibold text-white">
                      {post.metrics?.likes} / {post.metrics?.reposts}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Engagement</div>
                    <div className="font-semibold text-orange-400">
                      {post.metrics?.engagementRate}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
