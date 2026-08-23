import { NextRequest, NextResponse } from "next/server";
import {
  BrandProfile,
  ContentBlueprint,
  CoreContextInput,
  FormatType,
  RAGContext,
} from "@/lib/types";
import {
  normalizeToBlueprint,
  repurposeFromBlueprint,
  regenerateSingleFormat,
  validateConsistency,
  DEFAULT_BRAND_PROFILES,
} from "@/lib/contextEngine";
import { swytchcode } from "@/lib/swytchcode";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      defaultBrandProfiles: DEFAULT_BRAND_PROFILES,
      supportedFormats: ["video", "thread", "caption", "blog"],
      engineVersion: "1.0.0-blueprint",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, input, brand, ragContext, blueprint, selectedFormats, format } = body as {
      action: "normalize" | "repurpose" | "full_pipeline" | "regenerate_single" | "validate";
      input?: CoreContextInput;
      brand?: BrandProfile;
      ragContext?: RAGContext;
      blueprint?: ContentBlueprint;
      selectedFormats?: FormatType[];
      format?: FormatType;
    };

    // 1. FULL PIPELINE: Normalize -> Repurpose All -> Validate
    if (action === "full_pipeline" && input && brand) {
      const generatedBlueprint = await normalizeToBlueprint(input, brand, ragContext);
      const formatsToGenerate: FormatType[] =
        selectedFormats && selectedFormats.length > 0
          ? selectedFormats
          : (["video", "thread", "caption", "blog"] as FormatType[]);

      const outputs = await repurposeFromBlueprint(generatedBlueprint, formatsToGenerate);
      const validation = await validateConsistency(generatedBlueprint, outputs);

      return NextResponse.json({
        success: true,
        data: {
          blueprint: generatedBlueprint,
          outputs,
          validation,
        },
      });
    }

    // 2. NORMALIZE CONTEXT TO SHARED BLUEPRINT
    if (action === "normalize" && input && brand) {
      const generatedBlueprint = await normalizeToBlueprint(input, brand, ragContext);
      return NextResponse.json({
        success: true,
        data: generatedBlueprint,
      });
    }

    // 3. REPURPOSE FORMATS FROM BLUEPRINT
    if (action === "repurpose" && blueprint) {
      const formatsToGenerate: FormatType[] =
        selectedFormats && selectedFormats.length > 0
          ? selectedFormats
          : (["video", "thread", "caption", "blog"] as FormatType[]);

      const outputs = await repurposeFromBlueprint(blueprint, formatsToGenerate);
      const validation = await validateConsistency(blueprint, outputs);

      return NextResponse.json({
        success: true,
        data: {
          outputs,
          validation,
        },
      });
    }

    // 4. REGENERATE SINGLE FORMAT
    if (action === "regenerate_single" && blueprint && format) {
      const singleOutput = await regenerateSingleFormat(blueprint, format);
      return NextResponse.json({
        success: true,
        data: singleOutput,
      });
    }

    // 5. VALIDATE CONSISTENCY
    if (action === "validate" && blueprint && body.outputs) {
      const validation = await validateConsistency(blueprint, body.outputs);
      return NextResponse.json({
        success: true,
        data: validation,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing payload in Context Engine request" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in /api/context-engine:", error);
    return NextResponse.json(
      { success: false, error: errorMsg || "Failed to process Context Engine request" },
      { status: 500 }
    );
  }
}
