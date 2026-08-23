"use client";

import React, { useState, useEffect } from "react";
import { SwytchcodeAuditEntry } from "@/lib/types";
import { ShieldCheck, X, Activity, RefreshCw, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

interface SwytchcodeAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwytchcodeAuditModal: React.FC<SwytchcodeAuditModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<SwytchcodeAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/swytchcode");
      const json = await res.json();
      if (json.success && json.data?.logs) {
        setLogs(json.data.logs);
      }
    } catch (e) {
      console.error("Failed to fetch Swytchcode logs", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#0b101b] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Swytchcode Execution Authority</h3>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  Kernel v2.20.15
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditable tool execution trail, API guardrails, and compliance logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAuditLogs}
              disabled={isLoading}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <Terminal className="h-4 w-4" />
              <span>Active Policy & Execution Rules</span>
            </div>
            <div className="text-slate-400 space-y-1 text-[11px]">
              <div>• Deterministic sandbox enforcement: <span className="text-emerald-400">ENABLED</span></div>
              <div>• Tool permission validation: <span className="text-emerald-400">STRICT</span></div>
              <div>• Real-time audit stream: <span className="text-emerald-400">RECORDING</span></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-300 text-xs">Recorded Tool Invocations ({logs.length})</h4>

            {logs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                No tool invocations recorded yet. Perform a trend fetch, RAG search, or generation to generate audit records.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.executionId}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 space-y-1.5 transition-colors hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-bold">{log.tool}</span>
                      <span className="text-[10px] text-slate-500 font-mono">[{log.executionId}]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{log.durationMs}ms</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          log.outcome === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {log.outcome.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {log.details && (
                    <div className="text-[10px] text-slate-400 truncate bg-slate-950/60 p-2 rounded border border-slate-800/40">
                      {JSON.stringify(log.details)}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 text-right">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
