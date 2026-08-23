"use client";

import React, { useState } from "react";
import { GeneratedContent, PlatformType, ScheduledPost } from "@/lib/types";
import {
  Zap,
  Twitter,
  Linkedin,
  Mail,
  RefreshCw,
  Calendar,
  Send,
  Sliders,
  ShieldCheck,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface ContentStudioProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  onRegenerate: (
    audience: GeneratedContent["audience"],
    tone: GeneratedContent["tone"]
  ) => void;
  onSchedulePost: (post: Omit<ScheduledPost, "id">) => void;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({
  content,
  isLoading,
  onRegenerate,
  onSchedulePost,
}) => {
  const [activePlatform, setActivePlatform] = useState<PlatformType>("twitter");
  const [selectedAudience, setSelectedAudience] = useState<GeneratedContent["audience"]>(
    content?.audience || "Tech Enthusiasts"
  );
  const [selectedTone, setSelectedTone] = useState<GeneratedContent["tone"]>(
    content?.tone || "Insightful & Analytical"
  );

  // Editable local draft state
  const [editedTwitterThread, setEditedTwitterThread] = useState<string[]>([]);
  const [editedLinkedinPost, setEditedLinkedinPost] = useState<string>("");
  const [editedNewsletterBody, setEditedNewsletterBody] = useState<string>("");
  const [editedNewsletterSubject, setEditedNewsletterSubject] = useState<string>("");

  const [copied, setCopied] = useState(false);
  const [scheduleTime, setScheduleTime] = useState<string>(
    new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)
  );

  // Sync edits when content changes
  React.useEffect(() => {
    if (content) {
      setEditedTwitterThread(content.posts.twitter.thread || []);
      setEditedLinkedinPost(content.posts.linkedin.post || "");
      setEditedNewsletterBody(content.posts.newsletter.bodyMarkdown || "");
      setEditedNewsletterSubject(content.posts.newsletter.subject || "");
    }
  }, [content]);

  const audienceOptions: GeneratedContent["audience"][] = [
    "Tech Enthusiasts",
    "Founders & Executives",
    "Developers",
    "General Public",
  ];

  const toneOptions: GeneratedContent["tone"][] = [
    "Insightful & Analytical",
    "Engaging & Viral",
    "Authoritative & Formal",
    "Provocative & Bold",
  ];

  if (!content) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
        <Zap className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 text-base font-semibold text-white">No Content Generated Yet</h3>
        <p className="mt-1 text-xs text-slate-400">
          Extract evidence in Stage 2 and click &ldquo;Generate Multi-Platform Content&rdquo; to begin editing and adapting drafts.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    let text = "";
    if (activePlatform === "twitter") {
      text = editedTwitterThread.join("\n\n");
    } else if (activePlatform === "linkedin") {
      text = editedLinkedinPost;
    } else {
      text = `# ${editedNewsletterSubject}\n\n${editedNewsletterBody}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScheduleCurrent = () => {
    let preview = "";
    let full: string | string[] = "";

    if (activePlatform === "twitter") {
      preview = editedTwitterThread[0] || "";
      full = editedTwitterThread;
    } else if (activePlatform === "linkedin") {
      preview = editedLinkedinPost.slice(0, 140) + "...";
      full = editedLinkedinPost;
    } else {
      preview = editedNewsletterSubject;
      full = editedNewsletterBody;
    }

    onSchedulePost({
      contentId: content.id,
      topic: content.topic,
      platform: activePlatform,
      contentPreview: preview,
      fullContent: full,
      scheduledTime: new Date(scheduleTime).toISOString(),
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
              <Zap className="h-4 w-4" />
              <span>STAGE 3: GROUNDED CONTENT GENERATOR & ADAPTER</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">{content.headline}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Grounded synthesis across multi-channel formats with verified evidence citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Grounding Score: <strong>{content.groundingScore}%</strong></span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Active Draft"}
            </button>
          </div>
        </div>

        {/* Tone & Audience Controls Bar */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 border-t border-slate-800/80 pt-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Target Audience
            </label>
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value as GeneratedContent["audience"])}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
            >
              {audienceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Editorial Tone
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as GeneratedContent["tone"])}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
            >
              {toneOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => onRegenerate(selectedAudience, selectedTone)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-white transition-all shadow"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-orange-400" : ""}`} />
              {isLoading ? "Regenerating..." : "Apply Tone & Re-Generate"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Editor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Platform Tabs & Live Draft Editor */}
        <div className="space-y-4 lg:col-span-2">
          {/* Platform Tab Buttons */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-1.5">
            <button
              onClick={() => setActivePlatform("twitter")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activePlatform === "twitter"
                  ? "bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 text-[#1DA1F2] shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Twitter className="h-4 w-4" />
              Twitter / X Thread ({editedTwitterThread.length} Tweets)
            </button>

            <button
              onClick={() => setActivePlatform("linkedin")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activePlatform === "linkedin"
                  ? "bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#38bdf8] shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn Post
            </button>

            <button
              onClick={() => setActivePlatform("newsletter")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activePlatform === "newsletter"
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="h-4 w-4" />
              Newsletter / Blog
            </button>
          </div>

          {/* Editor Area */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            {activePlatform === "twitter" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Thread Composition</span>
                  <span>{editedTwitterThread.length} connected tweets</span>
                </div>

                {editedTwitterThread.map((tweet, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Tweet #{idx + 1}</span>
                      <span className={tweet.length > 280 ? "text-rose-400 font-bold" : "text-slate-400"}>
                        {tweet.length} / 280 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={tweet}
                      onChange={(e) => {
                        const newThread = [...editedTwitterThread];
                        newThread[idx] = e.target.value;
                        setEditedTwitterThread(newThread);
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                ))}

                {/* Hashtags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] text-slate-500">Auto Hashtags:</span>
                  {content.posts.twitter.hashtags.map((h, i) => (
                    <span key={i} className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activePlatform === "linkedin" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Executive Thought-Leadership Draft</span>
                  <span className="text-slate-400">{editedLinkedinPost.length} chars</span>
                </div>

                <textarea
                  rows={10}
                  value={editedLinkedinPost}
                  onChange={(e) => setEditedLinkedinPost(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none font-sans leading-relaxed"
                />

                {/* Takeaways */}
                <div className="space-y-1.5 rounded-xl bg-slate-950/40 p-3 border border-slate-800/60">
                  <span className="text-[11px] font-semibold text-slate-400">Key Takeaways for Leaders:</span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {content.posts.linkedin.takeaways.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activePlatform === "newsletter" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={editedNewsletterSubject}
                    onChange={(e) => setEditedNewsletterSubject(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Markdown Article Body
                  </label>
                  <textarea
                    rows={12}
                    value={editedNewsletterBody}
                    onChange={(e) => setEditedNewsletterBody(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Scheduling & Citations Inspector */}
        <div className="space-y-4">
          {/* Scheduling Widget */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Calendar className="h-4 w-4 text-orange-400" />
              Schedule & Dispatch
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Publishing Time Slot
              </label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleScheduleCurrent}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
              Add {activePlatform.toUpperCase()} Draft to Queue
            </button>
          </div>

          {/* Citation Inspector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Citations & Evidence Verification
            </h4>

            <div className="space-y-2">
              {content.posts[activePlatform === "blog" ? "newsletter" : activePlatform]?.citations?.map(
                (citation, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-2 text-xs text-emerald-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{citation}</span>
                  </div>
                )
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
              Each draft is verified against indexed RAG chunks. Citations link back to original Hacker News or TechCrunch source records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
