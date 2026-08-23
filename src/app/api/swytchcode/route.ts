import { NextResponse } from "next/server";
import { swytchcode } from "@/lib/swytchcode";

export async function GET() {
  try {
    const logs = swytchcode.getRecentAuditLogs(40);
    const doctorReport = swytchcode.runDoctor();

    return NextResponse.json({
      success: true,
      data: {
        status: "active",
        version: "2.20.15",
        kernel: "swytchcode-authority-v2",
        doctorReport,
        totalInvocations: logs.length,
        logs,
      },
    });
  } catch (error) {
    console.error("Error in /api/swytchcode:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Swytchcode audit logs" },
      { status: 500 }
    );
  }
}
