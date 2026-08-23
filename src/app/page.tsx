"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TrendDiscovery } from "@/components/TrendDiscovery";
import { RAGEvidenceViewer } from "@/components/RAGEvidenceViewer";
import { ContentStudio } from "@/components/ContentStudio";
import { PublishingQueue } from "@/components/PublishingQueue";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { SwytchcodeAuditModal } from "@/components/SwytchcodeAuditModal";
import {
  TrendItem,
  RAGContext,
  GeneratedContent,
  ScheduledPost
} from "@/lib/types";
import { FALLBACK_TRENDS } from "@/lib/trends";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "trends" | "rag" | "studio" | "queue" | "analytics"
  >("trends");

  // App Data States
  const [trends, setTrends] = useState<TrendItem[]>(FALLBACK_TRENDS);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [ragContext, setRagContext] = useState<RAGContext | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [queue, setQueue] = useState<ScheduledPost[]>([]);

  // Loading States
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [isLoadingRAG, setIsLoadingRAG] = useState(false);
  const [isLoadingGen, setIsLoadingGen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Initial Data Load
  useEffect(() => {
    fetchTrends();
    fetchQueue();
  }, []);

  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const res = await fetch("/api/trends");
      const json = await res.json();
      if (json.success && json.data) {
        setTrends(json.data);
      }
    } catch (e) {
      console.error("Failed to load trends", e);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/schedule");
      const json = await res.json();
      if (json.success && json.data) {
        setQueue(json.data);
      }
    } catch (e) {
      console.error("Failed to load publishing queue", e);
    }
  };

  // Stage 1 -> 2: Select Trend and Trigger RAG
  const handleSelectTrend = async (trend: TrendItem) => {
    setSelectedTrend(trend);
    setActiveTab("rag");
    setIsLoadingRAG(true);

    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: trend.id, customQuery: trend.title }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRagContext(json.data);
      }
    } catch (e) {
      console.error("Failed to retrieve RAG evidence", e);
    } finally {
      setIsLoadingRAG(false);
    }
  };

  // Stage 2: Custom RAG Query Re-run
  const handleCustomRAGQuery = async (query: string) => {
    if (!selectedTrend) return;
    setIsLoadingRAG(true);

    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: selectedTrend.id, customQuery: query }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRagContext(json.data);
      }
    } catch (e) {
      console.error("Failed to run custom RAG query", e);
    } finally {
      setIsLoadingRAG(false);
    }
  };

  // Stage 2 -> 3: Proceed to Generate Multi-Platform Content
  const handleProceedToStudio = async () => {
    if (!selectedTrend || !ragContext) return;
    setActiveTab("studio");
    setIsLoadingGen(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTrend.title,
          ragContext,
          audience: "Tech Enthusiasts",
          tone: "Insightful & Analytical",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedContent(json.data);
      }
    } catch (e) {
      console.error("Failed to generate grounded content", e);
    } finally {
      setIsLoadingGen(false);
    }
  };

  // Stage 3: Regenerate with customized Tone/Audience
  const handleRegenerate = async (
    audience: GeneratedContent["audience"],
    tone: GeneratedContent["tone"]
  ) => {
    if (!selectedTrend || !ragContext) return;
    setIsLoadingGen(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTrend.title,
          ragContext,
          audience,
          tone,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedContent(json.data);
      }
    } catch (e) {
      console.error("Failed to regenerate content", e);
    } finally {
      setIsLoadingGen(false);
    }
  };

  // Stage 3 -> 4: Schedule Post to Queue
  const handleSchedulePost = async (postData: Omit<ScheduledPost, "id">) => {
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", post: postData }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setQueue((prev) => [json.data, ...prev]);
        setActiveTab("queue");
      }
    } catch (e) {
      console.error("Failed to schedule post", e);
    }
  };

  // Stage 4: Trigger Publish Action
  const handleTriggerPublish = async (postId: string) => {
    setIsPublishing(true);
    try {
      // Transition to PUBLISHING
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          postId,
          newStatus: "PUBLISHING",
        }),
      });

      // Update local state to PUBLISHING
      setQueue((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: "PUBLISHING" } : p))
      );

      // Simulate 1.5s network execution
      await new Promise((r) => setTimeout(r, 1500));

      // Transition to PUBLISHED
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          postId,
          newStatus: "PUBLISHED",
        }),
      });
      const json = await res.json();
      if (json.success && json.queue) {
        setQueue(json.queue);
      }
    } catch (e) {
      console.error("Failed to trigger publish", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const pendingPublishCount = queue.filter((p) => p.status === "SCHEDULED").length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        pendingPublishCount={pendingPublishCount}
      />

      {/* Main Stage View */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === "trends" && (
          <TrendDiscovery
            trends={trends}
            isLoading={isLoadingTrends}
            onRefresh={fetchTrends}
            onSelectTrend={handleSelectTrend}
            selectedTrendId={selectedTrend?.id}
          />
        )}

        {activeTab === "rag" && (
          <RAGEvidenceViewer
            trend={selectedTrend}
            ragContext={ragContext}
            isLoading={isLoadingRAG}
            onRunCustomQuery={handleCustomRAGQuery}
            onProceedToStudio={handleProceedToStudio}
          />
        )}

        {activeTab === "studio" && (
          <ContentStudio
            content={generatedContent}
            isLoading={isLoadingGen}
            onRegenerate={handleRegenerate}
            onSchedulePost={handleSchedulePost}
          />
        )}

        {activeTab === "queue" && (
          <PublishingQueue
            queue={queue}
            onTriggerPublish={handleTriggerPublish}
            isLoading={isPublishing}
          />
        )}

        {activeTab === "analytics" && <AnalyticsDashboard queue={queue} />}
      </main>

      {/* Swytchcode Audit Inspector Modal */}
      <SwytchcodeAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
