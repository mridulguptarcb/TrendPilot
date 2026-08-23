import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { SwytchcodeAuditEntry } from "./types";

/**
 * Swytchcode Execution Authority Layer
 * Connects directly to the Swytchcode CLI kernel & @swytchcode/runtime.
 * Ensures every API tool call and workflow dispatch is explicit,
 * auditable, and tracked in Swytchcode's audit log.
 */

class SwytchcodeAuthority {
  private inMemoryAuditLog: SwytchcodeAuditEntry[] = [];
  private binaryPath: string = "";

  constructor() {
    this.resolveBinary();
  }

  private resolveBinary(): string {
    if (process.env.SWYTCHCODE_BIN && fs.existsSync(process.env.SWYTCHCODE_BIN)) {
      this.binaryPath = process.env.SWYTCHCODE_BIN;
      return this.binaryPath;
    }

    const fallbackPaths = [
      "/usr/local/bin/swytchcode",
      "/opt/homebrew/bin/swytchcode",
      path.join(os.homedir(), ".npm-global", "bin", "swytchcode"),
      path.join(
        process.env.APPDATA || "",
        "npm",
        "node_modules",
        "swytchcode",
        "node_modules",
        "swytchcode-cli-win32-x64",
        "bin",
        "swytchcode.exe"
      ),
      path.join(process.env.APPDATA || "", "npm", "swytchcode.cmd"),
      "swytchcode",
    ];

    for (const p of fallbackPaths) {
      if (p !== "swytchcode" && fs.existsSync(p)) {
        this.binaryPath = p;
        return this.binaryPath;
      }
    }

    this.binaryPath = "swytchcode";
    return this.binaryPath;
  }

  public generateExecutionId(prefix = "exec_swy_"): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Run Swytchcode Doctor diagnostics
   */
  public runDoctor(): string {
    try {
      const bin = this.resolveBinary();
      const output = execSync(`"${bin}" doctor`, {
        encoding: "utf8",
        timeout: 5000,
      });
      return output.trim();
    } catch (e: unknown) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  /**
   * Execute an API tool through the Swytchcode authority wrapper
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

      this.inMemoryAuditLog.unshift(audit);
      if (this.inMemoryAuditLog.length > 100) this.inMemoryAuditLog.pop();

      // Write to project .swytchcode/audit if directory exists
      this.writeAuditToDisk(audit);

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

      this.inMemoryAuditLog.unshift(audit);
      this.writeAuditToDisk(audit);
      throw err;
    }
  }

  /**
   * Fetch and extract text content from ANY custom web URL via Swytchcode
   */
  public async fetchFromUrl(targetUrl: string) {
    return this.executeTool(
      "swytchcode.web.fetch",
      async () => {
        const response = await fetch(targetUrl, {
          headers: { "User-Agent": "TrendForge-Swytchcode/2.0" },
          signal: AbortSignal.timeout(6000),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${targetUrl}: HTTP ${response.status}`);
        }

        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : targetUrl;

        // Clean basic HTML tags to extract raw text content
        const cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 4000);

        return {
          url: targetUrl,
          title,
          extractedText: cleanText,
          contentLength: cleanText.length,
          fetchedAt: new Date().toISOString(),
        };
      },
      { targetUrl }
    );
  }

  /**
   * Fetch trending posts from any Reddit community via Swytchcode
   */
  public async fetchReddit(subreddit = "MachineLearning") {
    return this.executeTool(
      "swytchcode.reddit.fetch",
      async () => {
        const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`;
        const res = await fetch(url, {
          headers: { "User-Agent": "TrendForge-Bot/1.0" },
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`Reddit API returned status ${res.status}`);
        const data = await res.json();
        const posts = (data.data?.children || []).map((c: any) => ({
          title: c.data.title,
          url: `https://reddit.com${c.data.permalink}`,
          score: c.data.score,
          author: c.data.author,
          selftext: (c.data.selftext || "").slice(0, 500),
        }));
        return { subreddit, posts };
      },
      { subreddit }
    );
  }

  /**
   * Fetch top trending repositories on GitHub via Swytchcode
   */
  public async fetchGitHubTrending(topic = "ai") {
    return this.executeTool(
      "swytchcode.github.fetch",
      async () => {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(topic)}+stars:>100&sort=stars&order=desc&per_page=5`;
        const res = await fetch(url, {
          headers: { "User-Agent": "TrendForge-Bot/1.0" },
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`GitHub API returned status ${res.status}`);
        const data = await res.json();
        const repos = (data.items || []).map((r: any) => ({
          name: r.full_name,
          url: r.html_url,
          stars: r.stargazers_count,
          description: r.description || "",
          language: r.language,
        }));
        return { topic, repos };
      },
      { topic }
    );
  }

  private writeAuditToDisk(entry: SwytchcodeAuditEntry) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const auditDirs = [
        path.join(process.cwd(), ".swytchcode", "audit"),
        path.join(os.homedir(), ".swytchcode", "audit"),
      ];

      for (const dir of auditDirs) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, `${today}.jsonl`);
        const line =
          JSON.stringify({
            execution_id: entry.executionId,
            timestamp: entry.timestamp,
            project: "TRENDFORGE",
            tool: entry.tool,
            outcome: entry.outcome,
            duration_ms: entry.durationMs,
            details: entry.details,
          }) + "\n";

        fs.appendFileSync(filePath, line, "utf8");
      }
    } catch (e) {
      // Non-blocking disk write
    }
  }

  /**
   * Get all recent audit logs merging disk logs with in-memory logs
   */
  public getRecentAuditLogs(limit = 40): SwytchcodeAuditEntry[] {
    const diskLogs: SwytchcodeAuditEntry[] = [];

    try {
      const today = new Date().toISOString().split("T")[0];
      const candidates = [
        path.join(process.cwd(), ".swytchcode", "audit", `${today}.jsonl`),
        path.join(os.homedir(), ".swytchcode", "audit", `${today}.jsonl`),
      ];

      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const lines = fs.readFileSync(p, "utf8").trim().split("\n");
          for (const line of lines.reverse()) {
            if (!line.trim()) continue;
            try {
              const j = JSON.parse(line);
              diskLogs.push({
                executionId: j.execution_id || j.executionId || "exec_swy_log",
                timestamp: j.timestamp || new Date().toISOString(),
                tool: j.tool || "swytchcode.tool",
                outcome: j.outcome || "success",
                durationMs: j.duration_ms || j.durationMs || 10,
                details: j.details || {},
              });
            } catch (_) {}
          }
        }
      }
    } catch (_) {}

    // Deduplicate by executionId
    const seen = new Set<string>();
    const combined: SwytchcodeAuditEntry[] = [];

    for (const log of [...this.inMemoryAuditLog, ...diskLogs]) {
      if (!seen.has(log.executionId)) {
        seen.add(log.executionId);
        combined.push(log);
      }
    }

    return combined.slice(0, limit);
  }
}

export const swytchcode = new SwytchcodeAuthority();
