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
  Check,
  Globe,
  Copy,
  Activity,
  Zap,
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
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  // Load saved default webhook from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("trendforge_default_webhook");
      if (saved) setWebhookUrl(saved);
    } catch (_) {}
  }, []);

  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    try {
      localStorage.setItem("trendforge_default_webhook", url.trim());
    } catch (_) {}
  };

  // Real Auto-runner for scheduled items: when scheduled time arrives, auto-dispatches
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      queue.forEach((item) => {
        if (item.status === "SCHEDULED") {
          const schedTime = new Date(item.scheduledTime).getTime();
          if (schedTime <= now) {
            if (webhookUrl.trim()) {
              handleRealWebhookDispatch(item);
            } else {
              handlePublish(item.id);
            }
          }
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [queue, webhookUrl]);

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

  // Real Free Webhook Dispatch to Discord / Slack / Telegram / Custom Webhook
  const handleRealWebhookDispatch = async (post: ScheduledPost) => {
    if (!webhookUrl.trim()) {
      alert("Please enter a valid Discord or Slack webhook URL.");
      return;
    }

    setIsSendingWebhook(true);
    setWebhookStatus("Dispatching live payload via Swytchcode authority...");

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
        setWebhookStatus("✅ Published successfully to real webhook via Swytchcode!");
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => setWebhookStatus(null), 4000);
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

  // 1-Click Free Real Telegram Share
  const openRealTelegram = (text: string) => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent("https://trendforge.ai")}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, "_blank", "noopener,noreferrer");
  };

  const copyTrackLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedTrackId(id);
    setTimeout(() => setCopiedTrackId(null), 2000);
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
            <span>STAGE 5: REAL MULTI-DESTINATION PUBLISHING QUEUE</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Autonomous Publishing & Webhook Broadcaster</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Execute real 1-click social posts (Twitter / LinkedIn / Telegram) and live automated Discord & Slack webhook broadcasts with verified delivery telemetry and click tracking.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-right">
          <div className="text-xs text-slate-400">Queue Items</div>
          <div className="text-2xl font-black text-white">{queue.length} items</div>
        </div>
      </div>

      {/* Real Discord / Slack Webhook Broadcaster Configuration */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Bot className="h-4 w-4" />
            <span>REAL MULTI-DESTINATION WEBHOOK: Discord / Slack / Custom Endpoint</span>
          </div>
          {webhookStatus && (
            <span className="text-xs font-semibold text-emerald-300 font-mono animate-pulse">
              {webhookStatus}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-300">
          Paste any Discord channel webhook URL or Slack webhook URL below. When queue items reach their schedule timestamp (or when you click &ldquo;Dispatch to Webhook&rdquo;), TrendForge transmits a live rich embed directly to your server via Swytchcode authority.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="url"
            placeholder="https://discord.com/api/webhooks/... (or Slack webhook URL)"
            value={webhookUrl}
            onChange={(e) => handleSaveWebhook(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Queue List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Queue Items & Multi-Channel Dispatch Log</h3>
          <span className="text-xs text-slate-400 font-mono">Real-Time Queue Telemetry</span>
        </div>

        {queue.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="mx-auto h-10 w-10 text-slate-600" />
            <h4 className="mt-3 text-sm font-semibold text-white">Publishing Queue Is Empty</h4>
            <p className="mt-1 text-xs text-slate-400">
              Add drafts from Stage 3 (Content Studio) or Stage 4 (Context Engine) to schedule and publish.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between transition-colors hover:bg-slate-900/90"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getPlatformIcon(item.platform)}
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {item.platform}
                    </span>
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] text-slate-500 font-mono">
                      Scheduled: {new Date(item.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {item.realEngagement && (
                      <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                        {item.realEngagement.wordCount} words • {item.realEngagement.charCount} chars • {item.realEngagement.verifiedCitationsCount} citations
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 font-mono">
                    {item.contentPreview}
                  </p>

                  {/* Real Delivery Telemetry Badge */}
                  {item.realDelivery && (
                    <div className="flex items-center gap-3 text-[11px] text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-mono">
                      <span className="flex items-center gap-1 font-bold">
                        <Activity className="h-3 w-3" />
                        HTTP {item.realDelivery.httpStatus} OK
                      </span>
                      <span>• Dest: {item.realDelivery.destination}</span>
                      <span>• Size: {item.realDelivery.payloadSizeBytes} bytes</span>
                      <span>• Latency: {item.realDelivery.latencyMs}ms</span>
                    </div>
                  )}

                  {/* Real Trackable Link */}
                  {item.trackableUrl && (
                    <div className="flex items-center gap-2 text-xs text-sky-400 pt-1">
                      <span className="text-slate-400 text-[11px]">Trackable Link:</span>
                      <a
                        href={item.trackableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[11px] underline hover:text-sky-300 truncate max-w-[280px]"
                      >
                        {item.trackableUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => copyTrackLink(item.trackableUrl!, item.id)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy tracking link"
                      >
                        {copiedTrackId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                      {item.realEngagement && item.realEngagement.clicks > 0 && (
                        <span className="rounded-full bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 font-bold">
                          {item.realEngagement.clicks} Real Clicks
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1">
                  {/* Real Free 1-Click Publishing Buttons */}
                  {item.platform === "twitter" && (
                    <button
                      onClick={() => openRealTwitter(item.contentPreview)}
                      className="flex items-center gap-1 rounded-xl border border-sky-500/40 bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition-all shadow-sm"
                      title="Post directly to your real Twitter account for free"
                    >
                      <Twitter className="h-3.5 w-3.5 text-sky-400" />
                      <span>Post to Twitter</span>
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
                      <span>Post to LinkedIn</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  <button
                    onClick={() => openRealTelegram(item.contentPreview)}
                    className="flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-sm"
                    title="Share to Telegram channel"
                  >
                    <Send className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Telegram</span>
                  </button>

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

                  {/* Trigger Publish Now */}
                  {item.status !== "PUBLISHED" && (
                    <button
                      onClick={() => handlePublish(item.id)}
                      disabled={publishingId === item.id || isLoading}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Zap className="h-3 w-3 fill-white" />
                      {publishingId === item.id ? "Publishing..." : "Publish (Swytchcode)"}
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

