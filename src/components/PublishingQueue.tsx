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
  Share2,
  Sparkles,
  Bot,
  Terminal,
  Check
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
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  // Auto-runner simulator for scheduled items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      queue.forEach((item) => {
        if (item.status === "SCHEDULED") {
          const schedTime = new Date(item.scheduledTime).getTime();
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

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Real Free Webhook Dispatch to Discord / Slack / Telegram
  const handleRealWebhookDispatch = async (post: ScheduledPost) => {
    if (!webhookUrl.trim()) {
      alert("Please enter a valid Discord or Slack webhook URL.");
      return;
    }

    setIsSendingWebhook(true);
    setWebhookStatus(null);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dispatch_webhook",
          webhookUrl: webhookUrl.trim(),
          post,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setWebhookStatus("Published successfully to real webhook via Swytchcode!");
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } else {
        setWebhookStatus(`Failed: ${json.error}`);
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      setWebhookStatus(`Error: ${err}`);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // 1-Click Free Real Twitter Intent
  const openRealTwitter = (text: string) => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  // 1-Click Free Real LinkedIn Share
  const openRealLinkedin = (text: string) => {
    navigator.clipboard.writeText(text);
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
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
            <span>STAGE 4: SCHEDULING & MULTI-CHANNEL DISPATCH</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Autonomous Publishing Engine</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Supports both <strong>100% Free Real Publishing</strong> (1-Click Twitter/LinkedIn intents & Discord/Slack webhooks) and autonomous simulated queue execution via Swytchcode authority.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-right">
          <div className="text-xs text-slate-400">Active Queue Items</div>
          <div className="text-2xl font-black text-white">{queue.length} items</div>
        </div>
      </div>

      {/* Real Discord / Webhook Live Broadcaster */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <Bot className="h-4 w-4" />
          <span>REAL FREE PUBLISHING: Instant Discord / Slack Webhook Broadcaster</span>
        </div>
        <p className="text-xs text-slate-300">
          Paste any free Discord channel webhook URL below. Clicking &ldquo;Dispatch to Real Webhook&rdquo; on any queue item will send a live rich embed directly to your real server through Swytchcode!
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="url"
            placeholder="https://discord.com/api/webhooks/... (or Slack webhook URL)"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
          />
          {webhookStatus && (
            <span className="text-xs font-semibold text-emerald-400 shrink-0">
              {webhookStatus}
            </span>
          )}
        </div>
      </div>

      {/* Queue List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <h3 className="text-sm font-semibold text-white">Queue Items & Multi-Channel Dispatch</h3>
        </div>

        {queue.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto h-10 w-10 text-slate-600" />
            <h4 className="mt-3 text-sm font-semibold text-white">Publishing Queue Is Empty</h4>
            <p className="mt-1 text-xs text-slate-400">
              Add drafts from Stage 3 (Content Studio) to schedule and publish across channels.
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

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Real Free 1-Click Publishing Buttons */}
                  {item.platform === "twitter" && (
                    <button
                      onClick={() => openRealTwitter(item.contentPreview)}
                      className="flex items-center gap-1 rounded-xl border border-sky-500/40 bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition-all shadow-sm"
                      title="Post directly to your real Twitter account for free"
                    >
                      <Twitter className="h-3.5 w-3.5 text-sky-400" />
                      <span>Post to Twitter (Free)</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  {item.platform === "linkedin" && (
                    <button
                      onClick={() => openRealLinkedin(item.contentPreview)}
                      className="flex items-center gap-1 rounded-xl border border-blue-500/40 bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition-all shadow-sm"
                      title="Share directly to your real LinkedIn profile for free"
                    >
                      <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                      <span>Post to LinkedIn (Free)</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  {/* Real Webhook Dispatch */}
                  {webhookUrl && (
                    <button
                      onClick={() => handleRealWebhookDispatch(item)}
                      disabled={isSendingWebhook}
                      className="flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-sm disabled:opacity-50"
                      title="Send this post directly to your real Discord/Slack channel"
                    >
                      <Bot className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Dispatch to Webhook</span>
                    </button>
                  )}

                  {/* Simulate Publish Now */}
                  {item.status !== "PUBLISHED" && (
                    <button
                      onClick={() => handlePublish(item.id)}
                      disabled={publishingId === item.id || isLoading}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      {publishingId === item.id ? "Publishing..." : "Simulate Publish"}
                    </button>
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
