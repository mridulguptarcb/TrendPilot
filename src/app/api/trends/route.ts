import { NextResponse } from "next/server";
import { fetchLiveTrends } from "@/lib/trends";
import { swytchcode } from "@/lib/swytchcode";

export async function GET() {
  try {
    const { result: trends, audit } = await swytchcode.executeTool(
      "rss.trends.fetch",
      async () => {
        return await fetchLiveTrends();
      },
      { source: "HackerNews + TechCrunch + Real-Time Aggregator" }
    );

    return NextResponse.json({
      success: true,
      data: trends,
      audit,
    });
  } catch (error) {
    console.error("Error in GET /api/trends:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, url, subreddit, topic } = body;

    if (source === "url" && url) {
      const { result, audit } = await swytchcode.fetchFromUrl(url);
      return NextResponse.json({ success: true, data: result, audit });
    }

    if (source === "reddit") {
      const { result, audit } = await swytchcode.fetchReddit(subreddit || "MachineLearning");
      return NextResponse.json({ success: true, data: result, audit });
    }

    if (source === "github") {
      const { result, audit } = await swytchcode.fetchGitHubTrending(topic || "ai");
      return NextResponse.json({ success: true, data: result, audit });
    }

    return NextResponse.json(
      { success: false, error: "Invalid source requested. Use 'url', 'reddit', or 'github'." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error in POST /api/trends:", error);
    return NextResponse.json(
      { success: false, error: msg || "Failed to fetch source data" },
      { status: 500 }
    );
  }
}
