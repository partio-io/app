"use client";

import { useState, useCallback } from "react";

interface CheckpointActionsProps {
  checkpointId: string;
  plan: string | undefined;
  activeTab: "sessions" | "plan" | "files";
}

export function CheckpointActions({
  checkpointId,
  plan,
  activeTab,
}: CheckpointActionsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = useCallback(() => {
    if (!plan) return;
    const blob = new Blob([plan], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [plan]);

  const command = `partio resume ${checkpointId}`;

  if (activeTab === "sessions") {
    return (
      <div className="shrink-0 rounded-lg border border-accent-orange/20 bg-accent-orange/5 p-3">
        <button
          onClick={() => handleCopy("resume", command)}
          className="inline-flex items-center gap-1.5 rounded-md border border-accent-orange/30 bg-accent-orange/15 px-2.5 py-1 text-xs font-medium text-accent-orange transition-colors hover:bg-accent-orange/25 cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          {copied === "resume" ? "Copied!" : "Resume Claude Code Session"}
        </button>
        <code className="mt-2 block rounded bg-surface px-2 py-1.5 font-mono text-[11px] text-muted">
          {command}
        </code>
      </div>
    );
  }

  if (activeTab === "plan" && plan) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => handleCopy("plan", plan)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-light px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-light/80 cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied === "plan" ? "Copied!" : "Copy Plan"}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-light px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-light/80 cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
      </div>
    );
  }

  return null;
}
