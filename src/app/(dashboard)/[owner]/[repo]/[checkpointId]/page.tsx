"use client";

import { use, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useCheckpoint,
  useSession as useCheckpointSession,
  useDiff,
  usePlan,
} from "@/hooks/use-checkpoints";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { TranscriptViewer } from "@/components/ui/transcript-viewer";
import { DiffViewer } from "@/components/ui/diff-viewer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Tab = "sessions" | "files" | "plan";

function countDiffFiles(diff: string | undefined): number {
  if (!diff) return 0;
  return (diff.match(/^diff --git/gm) || []).length;
}

function extractToolCount(messages: { content: string }[]): number {
  const tools = new Set<string>();
  for (const msg of messages) {
    const matches = msg.content.match(/\[Tool: (.+?)\]/g);
    if (matches) {
      for (const m of matches) {
        tools.add(m.replace("[Tool: ", "").replace("]", ""));
      }
    }
  }
  return tools.size;
}

export default function CheckpointDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; checkpointId: string }>;
}) {
  const { owner, repo, checkpointId } = use(params);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { checkpoint, isLoading: cpLoading } = useCheckpoint(
    owner,
    repo,
    checkpointId
  );
  const { messages, isLoading: sessionLoading } = useCheckpointSession(
    owner,
    repo,
    checkpointId
  );
  const { diff, isLoading: diffLoading } = useDiff(
    owner,
    repo,
    checkpointId
  );
  const { plan, isLoading: planLoading } = usePlan(
    owner,
    repo,
    checkpointId
  );

  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab === "plan" || initialTab === "files" ? initialTab : "sessions"
  );

  const pageTitle = useMemo(() => {
    if (!messages || messages.length === 0) return null;
    const firstHuman = messages.find(
      (m) => m.role === "human" || m.role === "user"
    );
    if (!firstHuman) return null;
    const text = firstHuman.content.trim();
    return text.length > 100 ? text.slice(0, 100) + "..." : text;
  }, [messages]);

  const totalTokens = useMemo(() => {
    if (!messages) return 0;
    return messages.reduce((sum, m) => sum + (m.tokens || 0), 0);
  }, [messages]);

  const fileCount = useMemo(() => countDiffFiles(diff), [diff]);

  if (cpLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!checkpoint) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Repositories", href: "/repositories" },
            { label: owner },
            { label: repo, href: `/${owner}/${repo}` },
            { label: checkpointId },
          ]}
        />
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">Checkpoint not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Repositories", href: "/repositories" },
          { label: owner },
          { label: repo, href: `/${owner}/${repo}` },
          { label: checkpointId.slice(0, 8) },
        ]}
      />

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-lg font-semibold text-foreground leading-snug">
          {pageTitle || checkpointId}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          {/* ID pill */}
          <span className="inline-flex items-center rounded-md bg-surface-light border border-border px-2 py-0.5 font-mono text-xs text-muted">
            {checkpointId.slice(0, 8)}
          </span>

          {/* Commit hash pill */}
          <span className="inline-flex items-center rounded-md bg-surface-light border border-border px-2 py-0.5 font-mono text-xs text-muted">
            {checkpoint.commit_hash.slice(0, 8)}
          </span>

          <span className="text-muted/60">·</span>

          {/* Date */}
          <span>
            {formatDistanceToNow(new Date(checkpoint.created_at), {
              addSuffix: true,
            })}
          </span>

          <span className="text-muted/60">·</span>

          {/* Branch */}
          <span className="inline-flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted"
            >
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            <span className="text-foreground">{checkpoint.branch}</span>
          </span>

          {totalTokens > 0 && (
            <>
              <span className="text-muted/60">·</span>
              <span>{totalTokens.toLocaleString()} tokens</span>
            </>
          )}

          {checkpoint.agent && (
            <>
              <span className="text-muted/60">·</span>
              <span className="inline-flex items-center rounded-full bg-accent-orange/15 px-2 py-0.5 text-xs font-medium text-accent-orange border border-accent-orange/30">
                {checkpoint.agent}
              </span>
              <span className="font-mono text-xs text-accent-orange">
                {checkpoint.agent_percent}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("sessions")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "sessions"
              ? "border-b-2 border-accent text-foreground"
              : "text-muted hover:text-foreground"
          )}
        >
          Sessions
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
              activeTab === "sessions"
                ? "bg-accent/20 text-accent-light"
                : "bg-surface-light text-muted"
            )}
          >
            1
          </span>
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "files"
              ? "border-b-2 border-accent text-foreground"
              : "text-muted hover:text-foreground"
          )}
        >
          Files
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
              activeTab === "files"
                ? "bg-accent/20 text-accent-light"
                : "bg-surface-light text-muted"
            )}
          >
            {fileCount}
          </span>
        </button>
        {checkpoint.plan_slug && (
          <button
            onClick={() => setActiveTab("plan")}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              activeTab === "plan"
                ? "border-b-2 border-accent text-foreground"
                : "text-muted hover:text-foreground"
            )}
          >
            Plan
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "sessions" &&
        (sessionLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <TranscriptViewer
            messages={messages || []}
            agentName={checkpoint.agent || undefined}
            agentPercent={checkpoint.agent_percent}
            userName={session?.user?.login || undefined}
            userImage={session?.user?.image || undefined}
          />
        ))}

      {activeTab === "files" &&
        (diffLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <DiffViewer diff={diff || ""} />
        ))}

      {activeTab === "plan" &&
        (planLoading ? (
          <Skeleton className="h-64" />
        ) : plan ? (
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
              {plan}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-muted">No plan data available</p>
          </div>
        ))}
    </div>
  );
}
