"use client";

import React, { useState, useEffect } from "react";
import {
  BrandProfile,
  ContentBlueprint,
  CoreContextInput,
  FormatType,
  RAGContext,
  RepurposedFormatSet,
  ScheduledPost,
  TrendItem,
  ConsistencyValidation,
  DEFAULT_BRAND_PROFILES,
} from "@/lib/types";
import {
  Sparkles,
  Layers,
  Video,
  Twitter,
  MessageSquare,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Flame,
  Database,
  ArrowRight,
  Eye,
  Edit3,
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  Radio,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ContextEngineProps {
  initialTrend: TrendItem | null;
  initialRagContext: RAGContext | null;
  trends: TrendItem[];
  onSchedulePost: (post: Omit<ScheduledPost, "id">) => void;
  onNavigateToTab: (tab: "trends" | "rag" | "studio" | "queue" | "analytics") => void;
}

export const ContextEngine: React.FC<ContextEngineProps> = ({
  initialTrend,
  initialRagContext,
  trends,
  onSchedulePost,
  onNavigateToTab,
}) => {
  // Input State
  const [sourceType, setSourceType] = useState<"manual" | "trend" | "rag" | "article">("manual");
  const [coreIdeaText, setCoreIdeaText] = useState<string>(
    "AI agents are changing customer support by resolving routine customer questions automatically, allowing human support teams to focus on complex problems."
  );
  const [selectedTrendId, setSelectedTrendId] = useState<string>(initialTrend?.id || trends[0]?.id || "");
  const [customSourceUrl, setCustomSourceUrl] = useState<string>("");

  // Brand Voice State
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(0);
  const [customBrandName, setCustomBrandName] = useState<string>(DEFAULT_BRAND_PROFILES[0].name);
  const [customAudience, setCustomAudience] = useState<string>(DEFAULT_BRAND_PROFILES[0].targetAudience);
  const [customTone, setCustomTone] = useState<string>(DEFAULT_BRAND_PROFILES[0].tone);
  const [customCta, setCustomCta] = useState<string>(DEFAULT_BRAND_PROFILES[0].defaultCta);
  const [isCustomizingBrand, setIsCustomizingBrand] = useState<boolean>(false);

  // Formats Selection State
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>(["video", "thread", "caption", "blog"]);

  // Results State
  const [blueprint, setBlueprint] = useState<ContentBlueprint | null>(null);
  const [outputs, setOutputs] = useState<RepurposedFormatSet | null>(null);
  const [validation, setValidation] = useState<ConsistencyValidation | null>(null);

  // UI View States
  const [activeOutputTab, setActiveOutputTab] = useState<FormatType>("video");
  const [viewMode, setViewMode] = useState<"tabs" | "grid">("tabs");
  const [showBlueprintDrawer, setShowBlueprintDrawer] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [regeneratingFormat, setRegeneratingFormat] = useState<FormatType | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editable Drafts State
  const [editedVideoScript, setEditedVideoScript] = useState<{ hook: string; body: string; cta: string } | null>(null);
  const [editedThread, setEditedThread] = useState<string[]>([]);
  const [editedCaption, setEditedCaption] = useState<string>("");
  const [editedBlog, setEditedBlog] = useState<string>("");

  // Pre-fill from props if provided
  useEffect(() => {
    if (initialTrend && !blueprint) {
      setSelectedTrendId(initialTrend.id);
      if (sourceType === "trend") {
        setCoreIdeaText(`${initialTrend.title}. ${initialTrend.summary}`);
      }
    }
  }, [initialTrend]);

  // Sync edits when outputs update
  useEffect(() => {
    if (outputs) {
      if (outputs.videoScript) {
        setEditedVideoScript({
          hook: outputs.videoScript.hook,
          body: outputs.videoScript.spokenBody.join("\n\n"),
          cta: outputs.videoScript.cta,
        });
      }
      if (outputs.thread) {
        setEditedThread(outputs.thread.fullThread);
      }
      if (outputs.socialCaption) {
        setEditedCaption(outputs.socialCaption.fullText);
      }
      if (outputs.blogSnippet) {
        setEditedBlog(outputs.blogSnippet.markdown);
      }
    }
  }, [outputs]);

  // Current Active Brand Profile Object
  const currentBrand: BrandProfile = {
    ...DEFAULT_BRAND_PROFILES[selectedBrandIndex],
    name: customBrandName || DEFAULT_BRAND_PROFILES[selectedBrandIndex].name,
    targetAudience: customAudience || DEFAULT_BRAND_PROFILES[selectedBrandIndex].targetAudience,
    tone: customTone || DEFAULT_BRAND_PROFILES[selectedBrandIndex].tone,
    defaultCta: customCta || DEFAULT_BRAND_PROFILES[selectedBrandIndex].defaultCta,
  };

  const handleBrandPresetChange = (idx: number) => {
    setSelectedBrandIndex(idx);
    const profile = DEFAULT_BRAND_PROFILES[idx];
    setCustomBrandName(profile.name);
    setCustomAudience(profile.targetAudience);
    setCustomTone(profile.tone);
    setCustomCta(profile.defaultCta);
  };

  const toggleFormat = (fmt: FormatType) => {
    if (selectedFormats.includes(fmt)) {
      if (selectedFormats.length > 1) {
        setSelectedFormats(selectedFormats.filter((f) => f !== fmt));
      }
    } else {
      setSelectedFormats([...selectedFormats, fmt]);
    }
  };

  // Demo Prompt Presets
  const samplePrompts = [
    {
      title: "AI in Customer Support",
      text: "AI agents are changing customer support by resolving routine customer questions automatically, allowing human support teams to focus on complex problems.",
    },
    {
      title: "Hybrid RAG 99% Grounding",
      text: "Modern RAG implementations achieve state-of-the-art accuracy by combining dense semantic vector search with sparse BM25 scoring and cross-encoder rerankers, reducing hallucinations by 88%.",
    },
    {
      title: "Wasm Edge Compute Latency",
      text: "Edge microservices are standardizing on WebAssembly (Wasm) runtimes to achieve sub-millisecond cold starts and 10x lower memory consumption compared to containerized microservices.",
    },
  ];

  // MAIN RUN: Repurpose Content Flow
  const handleRepurposeContent = async () => {
    setIsGenerating(true);
    setStatusMessage("Distilling Core Context into Shared Blueprint...");

    let rawContextContent = coreIdeaText;
    let topicName = "Core Strategic Idea";
    let sourceUrl = customSourceUrl;
    let activeRag = initialRagContext;

    if (sourceType === "trend") {
      const found = trends.find((t) => t.id === selectedTrendId) || trends[0];
      if (found) {
        topicName = found.topic || found.title;
        rawContextContent = found.rawText || `${found.title}. ${found.summary}`;
        sourceUrl = found.url;
      }
    } else if (sourceType === "rag" && initialRagContext) {
      topicName = initialRagContext.topic;
      rawContextContent = initialRagContext.evidence.map((e) => e.chunkText).join(" ");
    }

    const inputPayload: CoreContextInput = {
      sourceType,
      rawContent: rawContextContent,
      topic: topicName,
      sourceUrl,
      evidenceChunks: activeRag?.evidence,
    };

    try {
      const res = await fetch("/api/context-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "full_pipeline",
          input: inputPayload,
          brand: currentBrand,
          ragContext: activeRag,
          selectedFormats,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setBlueprint(json.data.blueprint);
        setOutputs(json.data.outputs);
        setValidation(json.data.validation);
        setStatusMessage(null);

        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setStatusMessage(`Error: ${json.error || "Failed to generate content"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Generation error: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // REGENERATE SINGLE FORMAT
  const handleRegenerateSingleFormat = async (fmt: FormatType) => {
    if (!blueprint) return;
    setRegeneratingFormat(fmt);

    try {
      const res = await fetch("/api/context-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate_single",
          blueprint,
          format: fmt,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setOutputs((prev) => ({
          ...prev,
          generatedAt: new Date().toISOString(),
          [fmt === "video" ? "videoScript" : fmt === "caption" ? "socialCaption" : fmt === "blog" ? "blogSnippet" : "thread"]:
            json.data[fmt === "video" ? "videoScript" : fmt === "caption" ? "socialCaption" : fmt === "blog" ? "blogSnippet" : "thread"],
        }));
      }
    } catch (err) {
      console.error(`Failed to regenerate ${fmt}`, err);
    } finally {
      setRegeneratingFormat(null);
    }
  };

  // Copy helper
  const handleCopy = (formatName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Direct Social Intent Sharing
  const handleTwitterShare = (tweetText: string) => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  const handleLinkedinShare = (postText: string) => {
    navigator.clipboard.writeText(postText);
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  };

  // Add to Publishing Queue
  const handleAddToQueue = (formatType: FormatType) => {
    if (!blueprint) return;

    let preview = "";
    let full: string | string[] = "";
    let platform: ScheduledPost["platform"] = "twitter";

    if (formatType === "video") {
      preview = editedVideoScript?.hook || outputs?.videoScript?.hook || "Short-form Video Script";
      full = `${editedVideoScript?.hook}\n\n${editedVideoScript?.body}\n\nCTA: ${editedVideoScript?.cta}`;
      platform = "twitter";
    } else if (formatType === "thread") {
      preview = editedThread[0] || outputs?.thread?.openingPost || "Thread Post 1";
      full = editedThread.length > 0 ? editedThread : outputs?.thread?.fullThread || [];
      platform = "twitter";
    } else if (formatType === "caption") {
      preview = (editedCaption || outputs?.socialCaption?.fullText || "").slice(0, 120) + "...";
      full = editedCaption || outputs?.socialCaption?.fullText || "";
      platform = "linkedin";
    } else {
      preview = outputs?.blogSnippet?.headline || blueprint.coreTopic;
      full = editedBlog || outputs?.blogSnippet?.markdown || "";
      platform = "newsletter";
    }

    onSchedulePost({
      contentId: blueprint.id,
      topic: blueprint.coreTopic,
      platform,
      contentPreview: preview,
      fullContent: full,
      scheduledTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      status: "SCHEDULED",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>CONTEXT ENGINE — &ldquo;ONE CORE IDEA → MANY PLATFORM-READY FORMATS&rdquo;</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Multi-Channel Brand Context Synthesizer</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Transform ONE core context into 4 platform-ready formats (Short-form Video Script, Thread, Social Caption, and Blog Snippet). Uses an intermediate <strong>Shared Content Blueprint</strong> to guarantee strict fact preservation and 100% brand voice alignment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {blueprint && (
              <button
                onClick={() => setShowBlueprintDrawer(!showBlueprintDrawer)}
                className="flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/20 transition-all shadow-sm"
              >
                <Eye className="h-4 w-4" />
                <span>{showBlueprintDrawer ? "Hide Shared Blueprint" : "Inspect Shared Blueprint"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Input & Brand Controls | Right Outputs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ================================================================= */}
        {/* LEFT PANEL: Core Context & Brand Configuration (5 Cols)          */}
        {/* ================================================================= */}
        <div className="space-y-5 lg:col-span-5">
          {/* Card: Core Context Input */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Layers className="h-4 w-4 text-orange-400" />
                1. Single Source of Truth
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Canonical Input</span>
            </div>

            {/* Source Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
              <button
                onClick={() => setSourceType("manual")}
                className={`rounded-lg py-1.5 font-medium transition-all ${
                  sourceType === "manual" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Core Idea
              </button>
              <button
                onClick={() => setSourceType("trend")}
                className={`rounded-lg py-1.5 font-medium transition-all ${
                  sourceType === "trend" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Live Trend
              </button>
              <button
                onClick={() => setSourceType("rag")}
                className={`rounded-lg py-1.5 font-medium transition-all ${
                  sourceType === "rag" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                RAG Evidence
              </button>
            </div>

            {/* Source Specific Input Area */}
            {sourceType === "manual" && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Enter Core Idea or Thesis
                </label>
                <textarea
                  rows={4}
                  value={coreIdeaText}
                  onChange={(e) => setCoreIdeaText(e.target.value)}
                  placeholder="Paste any article paragraph, product release note, or core strategic idea..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none font-sans leading-relaxed"
                />

                {/* Sample Prompt Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">Try sample benchmark ideas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCoreIdeaText(p.text)}
                        className="rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-[10px] text-slate-300 hover:border-orange-500/40 hover:text-orange-300 transition-all text-left truncate max-w-[200px]"
                        title={p.text}
                      >
                        ⚡ {p.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sourceType === "trend" && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Live Ingested Trend
                </label>
                <select
                  value={selectedTrendId}
                  onChange={(e) => {
                    setSelectedTrendId(e.target.value);
                    const found = trends.find((t) => t.id === e.target.value);
                    if (found) setCoreIdeaText(`${found.title}. ${found.summary}`);
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  {trends.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.title.slice(0, 55)}...
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/40 line-clamp-3">
                  {trends.find((t) => t.id === selectedTrendId)?.summary || coreIdeaText}
                </p>
              </div>
            )}

            {sourceType === "rag" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Indexed RAG Evidence Chunks
                  </span>
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-mono">
                    {initialRagContext?.evidence.length || 0} Chunks
                  </span>
                </div>
                {initialRagContext ? (
                  <div className="max-h-40 overflow-y-auto space-y-2 rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs">
                    <p className="font-semibold text-orange-400">{initialRagContext.topic}</p>
                    {initialRagContext.evidence.slice(0, 2).map((chunk, i) => (
                      <p key={i} className="text-slate-300 text-[11px] italic">
                        &ldquo;{chunk.chunkText.slice(0, 120)}...&rdquo;
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center text-xs text-slate-400">
                    No active RAG session from Stage 2. Please select a trend from Stage 1 or enter a manual idea.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card: Brand Voice & Audience Configuration */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Sliders className="h-4 w-4 text-orange-400" />
                2. Brand Voice & Audience
              </h3>
              <button
                onClick={() => setIsCustomizingBrand(!isCustomizingBrand)}
                className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                {isCustomizingBrand ? "Done Editing" : "Customize"}
              </button>
            </div>

            {/* Brand Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Brand Profile Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_BRAND_PROFILES.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    onClick={() => handleBrandPresetChange(idx)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      selectedBrandIndex === idx
                        ? "border-orange-500 bg-orange-500/10 text-white shadow-sm"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{p.name.split(" & ")[0]}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.tone}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Brand Inputs (Collapsible or in-place) */}
            {isCustomizingBrand ? (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Brand Name</label>
                  <input
                    type="text"
                    value={customBrandName}
                    onChange={(e) => setCustomBrandName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Target Audience</label>
                  <input
                    type="text"
                    value={customAudience}
                    onChange={(e) => setCustomAudience(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Editorial Tone</label>
                  <input
                    type="text"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Default Call to Action (CTA)</label>
                  <input
                    type="text"
                    value={customCta}
                    onChange={(e) => setCustomCta(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Audience:</span>
                  <span className="text-slate-200 font-semibold">{currentBrand.targetAudience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tone:</span>
                  <span className="text-orange-400 font-semibold">{currentBrand.tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Preferred Vocab:</span>
                  <span className="text-emerald-400 truncate max-w-[180px]">{currentBrand.preferredWords.slice(0, 3).join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avoided Words:</span>
                  <span className="text-rose-400 truncate max-w-[180px]">{currentBrand.avoidedWords.slice(0, 3).join(", ")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card: Platform Format Toggles & Execution Trigger */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Radio className="h-4 w-4 text-orange-400" />
              3. Target Output Formats
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleFormat("video")}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  selectedFormats.includes("video")
                    ? "border-orange-500 bg-orange-500/15 text-orange-300"
                    : "border-slate-800 bg-slate-950 text-slate-500"
                }`}
              >
                <Video className="h-4 w-4" />
                <span>Short Video Script</span>
              </button>

              <button
                onClick={() => toggleFormat("thread")}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  selectedFormats.includes("thread")
                    ? "border-sky-500 bg-sky-500/15 text-sky-300"
                    : "border-slate-800 bg-slate-950 text-slate-500"
                }`}
              >
                <Twitter className="h-4 w-4" />
                <span>Sequential Thread</span>
              </button>

              <button
                onClick={() => toggleFormat("caption")}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  selectedFormats.includes("caption")
                    ? "border-blue-500 bg-blue-500/15 text-blue-300"
                    : "border-slate-800 bg-slate-950 text-slate-500"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Social Caption</span>
              </button>

              <button
                onClick={() => toggleFormat("blog")}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  selectedFormats.includes("blog")
                    ? "border-amber-500 bg-amber-500/15 text-amber-300"
                    : "border-slate-800 bg-slate-950 text-slate-500"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Blog Snippet</span>
              </button>
            </div>

            {/* Repurpose Action Button */}
            <button
              onClick={handleRepurposeContent}
              disabled={isGenerating || !coreIdeaText.trim()}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 disabled:opacity-50 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition-all active:scale-95"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Synthesizing Blueprint & Formats..." : "Repurpose Content (All Formats)"}
            </button>

            {statusMessage && (
              <div className="text-center text-xs text-orange-400 animate-pulse font-mono">
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PANEL: Repurposed Outputs & Consistency Inspector (7 Cols)  */}
        {/* ================================================================= */}
        <div className="space-y-5 lg:col-span-7">
          {/* Blueprint Drawer (When Open) */}
          {showBlueprintDrawer && blueprint && (
            <div className="rounded-2xl border border-orange-500/40 bg-slate-900/95 p-5 shadow-2xl space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>SHARED CONTENT BLUEPRINT (SINGLE SOURCE OF TRUTH)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{blueprint.id}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Canonical Topic:</span>
                  <p className="text-white font-bold">{blueprint.coreTopic}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Canonical Core Message:</span>
                  <p className="text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 italic font-serif">
                    &ldquo;{blueprint.coreMessage}&rdquo;
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Distilled Key Points:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1 text-[11px]">
                    {blueprint.keyPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Grounded Facts & Stats:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {blueprint.importantFacts.map((f, i) => (
                      <span key={i} className="rounded bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quality & Brand Consistency Metrics Bar */}
          {validation && (
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Brand Consistency & Context Alignment</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  PASSED VALIDATION
                </span>
              </div>

              {/* Progress Meters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Brand Consistency Score</span>
                    <span className="font-bold text-orange-400">{validation.brandConsistencyScore}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${validation.brandConsistencyScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Context Alignment Score</span>
                    <span className="font-bold text-emerald-400">{validation.contextAlignmentScore}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${validation.contextAlignmentScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Validation Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {validation.analysisNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[10px] text-slate-300"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Formats Output Container */}
          {!outputs ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center space-y-3">
              <Sparkles className="mx-auto h-12 w-12 text-slate-600 animate-pulse" />
              <h4 className="text-base font-bold text-white">Context Engine Ready</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Click <strong>&ldquo;Repurpose Content (All Formats)&rdquo;</strong> to transform your core idea into synchronized Video Scripts, Threads, Social Captions, and Blog Snippets with shared brand voice.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden space-y-4 p-5">
              {/* Header: Platform Format Switcher & View Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-4">
                {/* Platform Tab Buttons */}
                <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
                  {outputs.videoScript && (
                    <button
                      onClick={() => setActiveOutputTab("video")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        activeOutputTab === "video"
                          ? "bg-orange-500 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" />
                      Video Script
                    </button>
                  )}

                  {outputs.thread && (
                    <button
                      onClick={() => setActiveOutputTab("thread")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        activeOutputTab === "thread"
                          ? "bg-sky-500 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Twitter className="h-3.5 w-3.5" />
                      Thread ({outputs.thread.fullThread.length})
                    </button>
                  )}

                  {outputs.socialCaption && (
                    <button
                      onClick={() => setActiveOutputTab("caption")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        activeOutputTab === "caption"
                          ? "bg-blue-500 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Social Caption
                    </button>
                  )}

                  {outputs.blogSnippet && (
                    <button
                      onClick={() => setActiveOutputTab("blog")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        activeOutputTab === "blog"
                          ? "bg-amber-500 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Blog Snippet
                    </button>
                  )}
                </div>

                {/* View Mode & Quick Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRegenerateSingleFormat(activeOutputTab)}
                    disabled={regeneratingFormat === activeOutputTab}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${regeneratingFormat === activeOutputTab ? "animate-spin text-orange-400" : ""}`} />
                    <span>Regenerate Format</span>
                  </button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* TAB 1: SHORT-FORM VIDEO SCRIPT                                */}
              {/* ============================================================= */}
              {activeOutputTab === "video" && outputs.videoScript && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">TikTok / Reels / Shorts Script</span>
                    <span className="rounded bg-orange-500/10 text-orange-400 px-2 py-0.5 font-mono text-[10px]">
                      Est. Duration: {outputs.videoScript.estimatedDuration || "45s - 60s"}
                    </span>
                  </div>

                  {/* Hook */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                      Spoken Hook (0:00 - 0:03s)
                    </span>
                    <textarea
                      rows={2}
                      value={editedVideoScript?.hook || ""}
                      onChange={(e) => setEditedVideoScript((prev) => ({ ...prev!, hook: e.target.value }))}
                      className="w-full bg-transparent text-xs text-white font-medium focus:outline-none"
                    />
                  </div>

                  {/* Visual Cues & Spoken Body */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Spoken Flow & Visual Directives
                      </span>
                    </div>

                    {outputs.videoScript.visualCues.map((cue, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-900/70 p-2.5 border border-slate-800/60 space-y-1 text-xs">
                        <span className="text-[10px] font-mono text-sky-400">{cue}</span>
                        <p className="text-slate-200">
                          {outputs.videoScript?.spokenBody[idx] || ""}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Spoken CTA */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Spoken Call to Action
                    </span>
                    <textarea
                      rows={2}
                      value={editedVideoScript?.cta || ""}
                      onChange={(e) => setEditedVideoScript((prev) => ({ ...prev!, cta: e.target.value }))}
                      className="w-full bg-transparent text-xs text-slate-200 font-medium focus:outline-none"
                    />
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() =>
                        handleCopy(
                          "video",
                          `HOOK:\n${editedVideoScript?.hook}\n\nBODY:\n${editedVideoScript?.body}\n\nCTA:\n${editedVideoScript?.cta}`
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
                    >
                      {copiedFormat === "video" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
                      {copiedFormat === "video" ? "Copied Script!" : "Copy Full Video Script"}
                    </button>

                    <button
                      onClick={() => handleAddToQueue("video")}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Add to Publishing Queue
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 2: THREAD FORMAT                                          */}
              {/* ============================================================= */}
              {activeOutputTab === "thread" && outputs.thread && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">X / Twitter / Threads Progressive Sequence</span>
                    <span className="text-slate-400">{editedThread.length} Connected Posts</span>
                  </div>

                  {editedThread.map((tweet, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="text-sky-400 font-bold">Post #{idx + 1}</span>
                        <span className={tweet.length > 280 ? "text-rose-400 font-bold" : "text-slate-400"}>
                          {tweet.length} / 280 chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={tweet}
                        onChange={(e) => {
                          const updated = [...editedThread];
                          updated[idx] = e.target.value;
                          setEditedThread(updated);
                        }}
                        className="w-full bg-transparent text-xs text-slate-200 focus:outline-none leading-relaxed"
                      />
                    </div>
                  ))}

                  {/* Hashtags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500">Auto Hashtags:</span>
                    {outputs.thread.hashtags.map((h, i) => (
                      <span key={i} className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy("thread", editedThread.join("\n\n"))}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
                      >
                        {copiedFormat === "thread" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
                        {copiedFormat === "thread" ? "Copied Thread!" : "Copy Full Thread"}
                      </button>

                      <button
                        onClick={() => handleTwitterShare(editedThread[0] || "")}
                        className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/20 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition-all"
                      >
                        <Twitter className="h-3.5 w-3.5 text-sky-400" />
                        <span>Post 1st Tweet to Twitter (Free)</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddToQueue("thread")}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Add to Publishing Queue
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 3: SOCIAL CAPTION                                         */}
              {/* ============================================================= */}
              {activeOutputTab === "caption" && outputs.socialCaption && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">LinkedIn & Professional Social Caption</span>
                    <span className="text-slate-400">{editedCaption.length} chars</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                    <textarea
                      rows={10}
                      value={editedCaption}
                      onChange={(e) => setEditedCaption(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-200 focus:outline-none leading-relaxed font-sans"
                    />
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy("caption", editedCaption)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
                      >
                        {copiedFormat === "caption" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
                        {copiedFormat === "caption" ? "Copied Caption!" : "Copy Social Caption"}
                      </button>

                      <button
                        onClick={() => handleLinkedinShare(editedCaption)}
                        className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-500/20 px-3.5 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition-all"
                      >
                        <Share2 className="h-3.5 w-3.5 text-blue-400" />
                        <span>Post to LinkedIn (Free)</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddToQueue("caption")}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Add to Publishing Queue
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 4: BLOG SNIPPET / EXECUTIVE BRIEF                         */}
              {/* ============================================================= */}
              {activeOutputTab === "blog" && outputs.blogSnippet && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Markdown Executive Brief & Blog Snippet</span>
                    <span className="text-slate-400">{editedBlog.length} chars</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                    <textarea
                      rows={14}
                      value={editedBlog}
                      onChange={(e) => setEditedBlog(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-200 focus:outline-none leading-relaxed font-mono"
                    />
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleCopy("blog", editedBlog)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
                    >
                      {copiedFormat === "blog" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
                      {copiedFormat === "blog" ? "Copied Markdown!" : "Copy Full Markdown"}
                    </button>

                    <button
                      onClick={() => handleAddToQueue("blog")}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Add to Publishing Queue
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
