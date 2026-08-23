import { SwytchcodeAuditEntry } from "./types";

/**
 * Swytchcode Execution Authority Layer
 * Ensures all API dispatches (trend retrieval, RAG lookup, publishing execution)
 * are auditable, verified, and logged in accordance with Swytchcode standards.
 */

class SwytchcodeAuthority {
  private auditLog: SwytchcodeAuditEntry[] = [];

  public generateExecutionId(prefix = "exec_swy_"): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Execute an API action through the Swytchcode authority wrapper
   */
  public async executeTool<T>(
    toolName: string,
    action: () => Promise<T>,
    meta?: Record<string, unknown>
  ): Promise<{ result: T; audit: SwytchcodeAuditEntry }> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    try {
      const result = await action();
      const durationMs = Date.now() - startTime;

      const audit: SwytchcodeAuditEntry = {
        executionId,
        timestamp: new Date().toISOString(),
        tool: toolName,
        outcome: "success",
        durationMs,
        details: meta,
      };

      this.auditLog.unshift(audit);
      // Keep last 100 entries in memory
      if (this.auditLog.length > 100) this.auditLog.pop();

      return { result, audit };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      const audit: SwytchcodeAuditEntry = {
        executionId,
        timestamp: new Date().toISOString(),
        tool: toolName,
        outcome: "failure",
        durationMs,
        details: { ...meta, error: errorMessage },
      };

      this.auditLog.unshift(audit);
      throw err;
    }
  }

  public getRecentAuditLogs(limit = 20): SwytchcodeAuditEntry[] {
    return this.auditLog.slice(0, limit);
  }
}

export const swytchcode = new SwytchcodeAuthority();
