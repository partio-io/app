"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ToolBadgeProps {
  name: string;
  className?: string;
}

export function ToolBadge({ name, className }: ToolBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-border bg-surface-light px-1.5 py-0.5 font-mono text-xs text-muted",
        className
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
      {name}
    </span>
  );
}

interface ToolUsagePillProps {
  toolNames: string[];
  className?: string;
}

export function ToolUsagePill({ toolNames, className }: ToolUsagePillProps) {
  const [expanded, setExpanded] = useState(false);

  if (toolNames.length === 0) return null;

  const unique = [...new Set(toolNames)];
  const count = unique.length;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-light px-2.5 py-1 text-xs text-muted cursor-pointer hover:bg-surface-light/80 transition-colors",
          className
        )}
      >
        {unique.slice(0, 3).map((_, i) => (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        ))}
        <span>{count} tools used</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-muted transition-transform", expanded && "rotate-90")}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {unique.map((name) => (
            <ToolBadge key={name} name={name} />
          ))}
        </div>
      )}
    </div>
  );
}
