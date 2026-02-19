"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  diff: string;
  className?: string;
}

interface DiffFile {
  header: string;
  hunks: string[];
}

function parseDiff(raw: string): DiffFile[] {
  const files: DiffFile[] = [];
  const lines = raw.split("\n");
  let currentFile: DiffFile | null = null;

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      if (currentFile) files.push(currentFile);
      currentFile = { header: line, hunks: [] };
    } else if (currentFile) {
      currentFile.hunks.push(line);
    }
  }

  if (currentFile) files.push(currentFile);
  return files;
}

function DiffFileBlock({ file }: { file: DiffFile }) {
  const [collapsed, setCollapsed] = useState(false);

  // Extract file path from header
  const pathMatch = file.header.match(/b\/(.+)$/);
  const filePath = pathMatch?.[1] || file.header;

  const additions = file.hunks.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const deletions = file.hunks.filter((l) => l.startsWith("-") && !l.startsWith("---")).length;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between bg-surface px-4 py-2 text-left cursor-pointer"
      >
        <span className="font-mono text-sm text-foreground">{filePath}</span>
        <div className="flex items-center gap-2">
          {additions > 0 && (
            <span className="text-xs text-success">+{additions}</span>
          )}
          {deletions > 0 && (
            <span className="text-xs text-red-400">-{deletions}</span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "text-muted transition-transform",
              collapsed && "-rotate-90"
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="overflow-x-auto bg-background">
          <pre className="text-xs leading-5">
            {file.hunks.map((line, idx) => {
              let lineClass = "text-muted";
              let bgClass = "";

              if (line.startsWith("+") && !line.startsWith("+++")) {
                lineClass = "text-success";
                bgClass = "bg-success/10";
              } else if (line.startsWith("-") && !line.startsWith("---")) {
                lineClass = "text-red-400";
                bgClass = "bg-red-500/10";
              } else if (line.startsWith("@@")) {
                lineClass = "text-accent-light";
                bgClass = "bg-accent/5";
              }

              return (
                <div
                  key={idx}
                  className={cn("px-4 py-0", bgClass)}
                >
                  <span className={lineClass}>{line}</span>
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}

export function DiffViewer({ diff, className }: DiffViewerProps) {
  if (!diff) {
    return (
      <div className={cn("rounded-xl border border-border bg-surface p-8 text-center", className)}>
        <p className="text-sm text-muted">No diff data available</p>
      </div>
    );
  }

  const files = parseDiff(diff);

  return (
    <div className={cn("space-y-3", className)}>
      {files.map((file, idx) => (
        <DiffFileBlock key={idx} file={file} />
      ))}
    </div>
  );
}
