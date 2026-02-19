"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ToolBadge } from "./tool-badge";
import type { Message } from "@/types/checkpoint";

interface TranscriptViewerProps {
  messages: Message[];
  className?: string;
}

const COLLAPSE_THRESHOLD = 500;

function MessageBubble({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false);
  const isHuman = message.role === "human" || message.role === "user";
  const isLong = message.content.length > COLLAPSE_THRESHOLD;
  const displayContent =
    !expanded && isLong
      ? message.content.slice(0, COLLAPSE_THRESHOLD) + "..."
      : message.content;

  // Check for tool usage patterns
  const toolMatch = message.content.match(/\[Tool: (.+?)\]/g);

  return (
    <div
      className={cn(
        "group",
        isHuman ? "flex justify-end" : "flex justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3",
          isHuman
            ? "border border-border bg-surface-light"
            : "bg-surface"
        )}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium text-accent-light">
            {isHuman ? "Human" : "Assistant"}
          </span>
          {message.tokens && (
            <span className="text-xs text-muted">
              {message.tokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        <div className="whitespace-pre-wrap text-sm text-foreground">
          {displayContent}
        </div>
        {toolMatch && (
          <div className="mt-2 flex flex-wrap gap-1">
            {toolMatch.map((match, idx) => {
              const name = match.replace("[Tool: ", "").replace("]", "");
              return <ToolBadge key={idx} name={name} />;
            })}
          </div>
        )}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-accent-light hover:text-accent cursor-pointer"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}

export function TranscriptViewer({
  messages,
  className,
}: TranscriptViewerProps) {
  if (messages.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border bg-surface p-8 text-center", className)}>
        <p className="text-sm text-muted">No transcript data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} />
      ))}
    </div>
  );
}
