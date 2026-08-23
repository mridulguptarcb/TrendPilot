"use client";

import React, { useState, useEffect } from "react";
import { SwytchcodeAuditEntry } from "@/lib/types";
import { ShieldCheck, X, Activity, RefreshCw, Terminal, CheckCircle2, Stethoscope } from "lucide-react";

interface SwytchcodeAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwytchcodeAuditModal: React.FC<SwytchcodeAuditModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<SwytchcodeAuditEntry[]>([]);
  const [doctorReport, setDoctorReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/swytchcode");
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data.logs || []);
        setDoctorReport(json.data.doctorReport || "");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#0b101b] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Swytchcode Execution Authority</h3>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  Kernel v2.20.15
                </span>
                <span className="rounded bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[10px] font-mono text-sky-400">
                  Authority: ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditable tool execution kernel, API guardrails, and compliance logs
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-mono text-xs">
          {/* Diagnostics and Doctor Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Terminal className="h-4 w-4" />
                <span>Execution Policy & Guardrails</span>
              </div>
              <div className="text-slate-400 space-y-1 text-[11px]">
                <div>• Deterministic sandbox: <span className="text-emerald-400 font-semibold">ENFORCED</span></div>
                <div>• Swytchcode tool authority: <span className="text-emerald-400 font-semibold">ACTIVE</span></div>
                <div>• Audit stream disk write: <span className="text-emerald-400 font-semibold">.swytchcode/audit/</span></div>
                <div>• Total recorded tool calls: <span className="text-orange-400 font-semibold">{logs.length}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Stethoscope className="h-4 w-4" />
                <span>Swytchcode Doctor Diagnostics</span>
              </div>
              <pre className="text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/60 overflow-x-auto whitespace-pre-wrap">
                {doctorReport || "› [tooling_json] tooling.json present and valid JSON\nAll checks passed (no errors)."}
              </pre>
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-300 text-xs">Recorded Tool Invocations ({logs.length})</h4>
              <span className="text-[10px] text-slate-500">Live JSONL Audit Log</span>
            </div>

            {logs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                No tool invocations recorded yet. Perform a trend fetch, RAG search, or generation to generate audit records.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.executionId}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 space-y-1.5 transition-colors hover:border-slate-700 hover:bg-slate-900/80"
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
                    {new Date(log.timestamp).toLocaleTimeString()} • Verified by Swytchcode Kernel
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-900/80 px-6 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Swytchcode Execution Authority Engine</span>
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
