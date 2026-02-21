"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ToolUsagePill } from "./tool-badge";
import type { Message } from "@/types/checkpoint";

interface TranscriptViewerProps {
  messages: Message[];
  agentName?: string;
  agentPercent?: number;
  userName?: string;
  userImage?: string;
  className?: string;
}

interface SessionStats {
  prompt: string;
  steps: number;
  toolCount: number;
  toolNames: string[];
  totalTokens: number;
  duration: string;
  startTime: string;
}

const COLLAPSE_THRESHOLD = 500;

function extractToolNames(content: string): string[] {
  const matches = content.match(/\[Tool: (.+?)\]/g);
  if (!matches) return [];
  return matches.map((m) => m.replace("[Tool: ", "").replace("]", ""));
}

function stripToolPatterns(content: string): string {
  return content
    .replace(/\[Tool: .+?\]/g, "")
    .replace(/\[Tool Result: [\s\S]*?\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function computeSessionStats(messages: Message[]): SessionStats {
  const humanMessages = messages.filter(
    (m) => m.role === "human" || m.role === "user"
  );
  const prompt =
    humanMessages.length > 0
      ? humanMessages[0].content.slice(0, 80) +
        (humanMessages[0].content.length > 80 ? "..." : "")
      : "Session";

  const allToolNames: string[] = [];
  for (const msg of messages) {
    allToolNames.push(...extractToolNames(msg.content));
  }
  const uniqueTools = [...new Set(allToolNames)];

  const totalTokens = messages.reduce((sum, m) => sum + (m.tokens || 0), 0);

  let duration = "—";
  if (messages.length >= 2) {
    const first = new Date(messages[0].timestamp).getTime();
    const last = new Date(messages[messages.length - 1].timestamp).getTime();
    if (!isNaN(first) && !isNaN(last) && last > first) {
      duration = formatDuration(last - first);
    }
  }

  let startTime = "";
  if (messages.length > 0) {
    const d = new Date(messages[0].timestamp);
    if (!isNaN(d.getTime())) {
      startTime = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return {
    prompt,
    steps: humanMessages.length,
    toolCount: uniqueTools.length,
    toolNames: allToolNames,
    totalTokens,
    duration,
    startTime,
  };
}

function AttributionBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent-orange"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className="text-xs text-muted">{percent}% AI</span>
    </div>
  );
}

function HumanAvatar({ userImage }: { userImage?: string }) {
  if (userImage) {
    return (
      <img
        src={userImage}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full border border-border"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-light border border-border">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="text-muted"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-orange/15 border border-accent-orange/30">
      <span className="text-xs font-bold text-accent-orange">A\</span>
    </div>
  );
}

function MessageRow({ message, userName, userImage }: { message: Message; userName?: string; userImage?: string }) {
  const [expanded, setExpanded] = useState(false);
  const isHuman = message.role === "human" || message.role === "user";
  const toolNames = extractToolNames(message.content);
  const cleanContent = isHuman
    ? message.content
    : stripToolPatterns(message.content);
  const isLong = cleanContent.length > COLLAPSE_THRESHOLD;
  const displayContent =
    !expanded && isLong
      ? cleanContent.slice(0, COLLAPSE_THRESHOLD) + "..."
      : cleanContent;

  return (
    <div className="flex gap-3 py-3">
      {isHuman ? <HumanAvatar userImage={userImage} /> : <AssistantAvatar />}
      <div className={cn("flex-1 min-w-0", !isHuman && "border-l-2 border-accent-orange/60 pl-3")}>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {isHuman ? (userName ?? "You") : "Assistant"}
          </span>
          {message.tokens != null && message.tokens > 0 && (
            <span className="text-xs text-muted">
              {message.tokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        {displayContent && (
          <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
            {displayContent}
          </div>
        )}
        {!isHuman && toolNames.length > 0 && (
          <div className="mt-2">
            <ToolUsagePill toolNames={toolNames} />
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

function groupMessages(messages: Message[]): Message[] {
  const result: Message[] = [];
  for (const msg of messages) {
    const isAssistant = msg.role === "assistant";
    const textContent = isAssistant ? stripToolPatterns(msg.content).trim() : "";
    const toolNames = isAssistant ? extractToolNames(msg.content) : [];
    const isToolOnly = isAssistant && textContent === "" && toolNames.length > 0;

    const prev = result[result.length - 1];
    if (
      isToolOnly &&
      prev &&
      prev.role === "assistant" &&
      stripToolPatterns(prev.content).trim() === "" &&
      extractToolNames(prev.content).length > 0
    ) {
      // Merge: append tool markers to previous message's content
      prev.content += "\n" + msg.content;
      // Keep the later timestamp and sum tokens
      prev.tokens = (prev.tokens || 0) + (msg.tokens || 0);
    } else {
      result.push({ ...msg });
    }
  }
  return result;
}

function SessionAccordion({
  messages,
  agentName,
  agentPercent,
  userName,
  userImage,
}: {
  messages: Message[];
  agentName?: string;
  agentPercent?: number;
  userName?: string;
  userImage?: string;
}) {
  const [open, setOpen] = useState(true);
  const stats = computeSessionStats(messages);
  const grouped = groupMessages(messages);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left cursor-pointer hover:bg-surface-light/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "shrink-0 text-muted transition-transform",
              open ? "rotate-0" : "-rotate-90"
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="text-sm text-foreground truncate">
            {stats.prompt}
          </span>
          {agentName && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-accent-orange/15 px-2 py-0.5 text-xs font-medium text-accent-orange border border-accent-orange/30">
              {agentName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs text-muted">
          {stats.startTime && <span>{stats.startTime}</span>}
          {stats.duration !== "—" && <span>{stats.duration}</span>}
          <span>{stats.steps} steps</span>
          {stats.toolCount > 0 && <span>{stats.toolCount} tools</span>}
          {stats.totalTokens > 0 && (
            <span>{stats.totalTokens.toLocaleString()} tokens</span>
          )}
          {agentPercent != null && (
            <AttributionBar percent={agentPercent} />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-4 divide-y divide-border/50">
          {grouped.map((msg, idx) => (
            <MessageRow key={idx} message={msg} userName={userName} userImage={userImage} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TranscriptViewer({
  messages,
  agentName,
  agentPercent,
  userName,
  userImage,
  className,
}: TranscriptViewerProps) {
  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-surface p-8 text-center",
          className
        )}
      >
        <p className="text-sm text-muted">No transcript data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <SessionAccordion
        messages={messages}
        agentName={agentName}
        agentPercent={agentPercent}
        userName={userName}
        userImage={userImage}
      />
    </div>
  );
}
