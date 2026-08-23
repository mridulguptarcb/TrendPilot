import { NextRequest, NextResponse } from "next/server";
import { ScheduledPost } from "@/lib/types";
import { swytchcode } from "@/lib/swytchcode";

// In-memory queue store for fast demo execution
const publishingQueue: ScheduledPost[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: publishingQueue,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, post, postId, newStatus, webhookUrl, customPlatform } = body;

    if (action === "add" && post) {
      const scheduledPost: ScheduledPost = {
        ...post,
        id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        status: post.status || "SCHEDULED",
      };

      publishingQueue.unshift(scheduledPost);

      return NextResponse.json({
        success: true,
        data: scheduledPost,
        queue: publishingQueue,
      });
    }

    // Real Free Webhook Dispatch (e.g. Discord, Slack, Telegram, Custom Endpoint)
    if (action === "dispatch_webhook" && webhookUrl && post) {
      const { result, audit } = await swytchcode.executeTool(
        "webhook.publish.dispatch",
        async () => {
          const payload = {
            username: "TrendForge Bot",
            avatar_url: "https://raw.githubusercontent.com/mridulguptarcb/TrendPilot/main/public/icon.png",
            content: `🚀 **TrendForge Real-Time Grounded Dispatch**\n\n**Topic:** ${post.topic}\n\n${post.contentPreview}\n\n*Verified by TrendForge RAG & Swytchcode*`,
            embeds: [
              {
                title: post.topic,
                description: Array.isArray(post.fullContent) ? post.fullContent.join("\n\n") : post.fullContent,
                color: 0xf97316,
                footer: { text: "TrendForge Autonomous RAG Engine" },
                timestamp: new Date().toISOString(),
              },
            ],
          };

          const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            throw new Error(`Webhook returned status ${res.status}: ${res.statusText}`);
          }
          return { success: true, status: res.status };
        },
        { webhookUrl: webhookUrl.slice(0, 35) + "...", topic: post.topic }
      );

      return NextResponse.json({
        success: true,
        data: result,
        audit,
      });
    }

    if (action === "update_status" && postId && newStatus) {
      const item = publishingQueue.find((p) => p.id === postId);
      if (item) {
        item.status = newStatus;
        if (newStatus === "PUBLISHED") {
          item.publishedAt = new Date().toISOString();
          item.simulatedUrl = `https://${item.platform}.com/trendforge/status/${Date.now()}`;
          item.metrics = {
            impressions: Math.floor(Math.random() * 8500) + 1200,
            likes: Math.floor(Math.random() * 420) + 45,
            reposts: Math.floor(Math.random() * 95) + 12,
            clicks: Math.floor(Math.random() * 630) + 80,
            engagementRate: Number((Math.random() * 3.8 + 2.1).toFixed(2)),
          };

          // Record publish event through Swytchcode authority
          await swytchcode.executeTool(
            `${item.platform}.publish.post`,
            async () => ({ success: true, simulatedId: item.simulatedUrl }),
            {
              platform: item.platform,
              postId: item.id,
              preview: item.contentPreview.slice(0, 80),
              simulated: true,
            }
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: item,
        queue: publishingQueue,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action payload" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in /api/schedule:", error);
    return NextResponse.json(
      { success: false, error: errorMsg || "Failed to process schedule request" },
      { status: 500 }
    );
  }
}
