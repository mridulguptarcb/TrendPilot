import { NextRequest, NextResponse } from "next/server";
import { chunkTrendContent, retrieveEvidence } from "@/lib/rag";
import { fetchLiveTrends } from "@/lib/trends";
import { swytchcode } from "@/lib/swytchcode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trendId, customQuery } = body;

    const { result: ragContext, audit } = await swytchcode.executeTool(
      "rag.vector.retrieve",
      async () => {
        const trends = await fetchLiveTrends();
        const selectedTrend = trends.find((t) => t.id === trendId) || trends[0];

        // Chunk the selected trend and related domain context
        const allChunks = trends.flatMap((t) => chunkTrendContent(t));
        const query = customQuery || selectedTrend.title;

        return retrieveEvidence(query, allChunks, 4);
      },
      { trendId, customQuery }
    );

    return NextResponse.json({
      success: true,
      data: ragContext,
      audit,
    });
  } catch (error) {
    console.error("Error in /api/rag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve RAG evidence" },
      { status: 500 }
    );
  }
}
