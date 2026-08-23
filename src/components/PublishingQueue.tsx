"use client";

import React, { useState, useEffect } from "react";
import { ScheduledPost } from "@/lib/types";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Twitter,
  Linkedin,
  Mail,
  Play,
  RotateCcw,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

interface PublishingQueueProps {
  queue: ScheduledPost[];
  onTriggerPublish: (postId: string) => Promise<void>;
  isLoading: boolean;
}

export const PublishingQueue: React.FC<PublishingQueueProps> = ({
  queue,
  onTriggerPublish,
  isLoading,
}) => {
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Auto-runner simulator for scheduled items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      queue.forEach((item) => {
        if (item.status === "SCHEDULED") {
          const schedTime = new Date(item.scheduledTime).getTime();
          // If scheduled time has passed or within 10 seconds
          if (schedTime <= now) {
            handlePublish(item.id);
          }
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [queue]);

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    await onTriggerPublish(id);
    setPublishingId(null);

    // Fire celebratory confetti for published item
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="h-4 w-4 text-[#1DA1F2]" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-[#0A66C2]" />;
      default:
        return <Mail className="h-4 w-4 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: ScheduledPost["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            PUBLISHED (LIVE)
          </span>
        );
      case "PUBLISHING":
        return (
          <span className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 animate-pulse">
            <Clock className="h-3 w-3 animate-spin" />
            DISPATCHING...
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-400">
            <Clock className="h-3 w-3" />
            SCHEDULED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
            <Send className="h-4 w-4" />
            <span>STAGE 4: SCHEDULING & PUBLISHING QUEUE</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Autonomous Publishing Queue</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Active queue runner dispatches scheduled content through Swytchcode tool execution authority. Real-time state transitions and simulated high-fidelity live links.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-right">
          <div className="text-xs text-slate-400">Active Queue Size</div>
          <div className="text-2xl font-black text-white">{queue.length} items</div>
        </div>
      </div>

      {/* Queue List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <h3 className="text-sm font-semibold text-white">Queue Items & Dispatch Pipeline</h3>
        </div>

        {queue.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto h-10 w-10 text-slate-600" />
            <h4 className="mt-3 text-sm font-semibold text-white">Publishing Queue Is Empty</h4>
            <p className="mt-1 text-xs text-slate-400">
              Add drafts from Stage 3 (Content Studio) to schedule and simulate real-time publication.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-900/90"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    {getPlatformIcon(item.platform)}
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {item.platform}
                    </span>
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] text-slate-500 font-mono">
                      Scheduled: {new Date(item.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 font-mono">
                    {item.contentPreview}
                  </p>

                  {item.status === "PUBLISHED" && item.simulatedUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <span>Simulated Live URL:</span>
                      <a
                        href={item.simulatedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[11px] underline hover:text-emerald-300"
                      >
                        {item.simulatedUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status !== "PUBLISHED" && (
                    <button
                      onClick={() => handlePublish(item.id)}
                      disabled={publishingId === item.id || isLoading}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      {publishingId === item.id ? "Publishing..." : "Simulate Publish Now"}
                    </button>
                  )}

                  {item.status === "PUBLISHED" && item.metrics && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Impressions</div>
                        <div className="font-semibold text-white">{item.metrics.impressions.toLocaleString()}</div>
                      </div>
                      <div className="h-6 w-px bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-500">Engagement</div>
                        <div className="font-semibold text-orange-400">{item.metrics.engagementRate}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
