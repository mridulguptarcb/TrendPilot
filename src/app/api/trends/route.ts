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
    console.error("Error in /api/trends:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
