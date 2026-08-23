import { NextRequest, NextResponse } from "next/server";
import { publishingQueue } from "@/lib/queueStore";

interface ClickEvent {
  postId: string;
  timestamp: string;
  targetUrl: string;
  userAgent?: string;
  referrer?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __trendforgeClickEventsLog: ClickEvent[] | undefined;
}

if (!globalThis.__trendforgeClickEventsLog) {
  globalThis.__trendforgeClickEventsLog = [];
}

const clickEventsLog: ClickEvent[] = globalThis.__trendforgeClickEventsLog;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const target = searchParams.get("target") || "https://news.ycombinator.com";
  const mode = searchParams.get("mode");

  // If requesting raw click analytics JSON
  if (mode === "stats") {
    return NextResponse.json({
      success: true,
      totalClicksRecorded: clickEventsLog.length,
      events: clickEventsLog.slice(0, 50),
    });
  }

  // If clicking a tracked link
  if (postId) {
    const post = publishingQueue.find((p) => p.id === postId);
    const event: ClickEvent = {
      postId,
      timestamp: new Date().toISOString(),
      targetUrl: target,
      userAgent: req.headers.get("user-agent") || undefined,
      referrer: req.headers.get("referer") || undefined,
    };

    clickEventsLog.unshift(event);
    if (clickEventsLog.length > 200) clickEventsLog.pop();

    if (post) {
      if (!post.realEngagement) {
        const text = Array.isArray(post.fullContent) ? post.fullContent.join(" ") : post.fullContent;
        post.realEngagement = {
          clicks: 0,
          wordCount: text.split(/\s+/).filter(Boolean).length,
          charCount: text.length,
          verifiedCitationsCount: (text.match(/https?:\/\/[^\s]+/g) || []).length,
        };
      }
      post.realEngagement.clicks += 1;
      post.realEngagement.lastClickTimestamp = event.timestamp;
      if (post.metrics) {
        post.metrics.clicks += 1;
      }
    }

    // Redirect to target URL or return confirmation page
    if (target.startsWith("http://") || target.startsWith("https://")) {
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.json({
    success: true,
    message: "TrendForge Real Click Tracker Active",
    totalClicks: clickEventsLog.length,
  });
}
