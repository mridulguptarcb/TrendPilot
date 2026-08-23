import { NextRequest, NextResponse } from "next/server";
import { generateGroundedContent } from "@/lib/gemini";
import { RAGContext } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, ragContext, audience, tone } = body as {
      topic: string;
      ragContext: RAGContext;
      audience?: "Tech Enthusiasts" | "Founders & Executives" | "Developers" | "General Public";
      tone?: "Insightful & Analytical" | "Engaging & Viral" | "Authoritative & Formal" | "Provocative & Bold";
    };

    if (!topic || !ragContext) {
      return NextResponse.json(
        { success: false, error: "Missing topic or ragContext" },
        { status: 400 }
      );
    }

    const generated = await generateGroundedContent(topic, ragContext, audience, tone);

    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
