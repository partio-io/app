"use client";

import { use, useState } from "react";
import {
  useCheckpoint,
  useSession as useCheckpointSession,
  useDiff,
} from "@/hooks/use-checkpoints";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TranscriptViewer } from "@/components/ui/transcript-viewer";
import { DiffViewer } from "@/components/ui/diff-viewer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Tab = "transcript" | "diff";

export default function CheckpointDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; checkpointId: string }>;
}) {
  const { owner, repo, checkpointId } = use(params);
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
    checkpoint?.commit_hash || ""
  );

  const [activeTab, setActiveTab] = useState<Tab>("transcript");

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

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-base font-semibold text-foreground">
              {checkpointId}
            </h2>
            <Badge>{checkpoint.branch}</Badge>
          </div>
          <span className="text-sm text-muted">
            {formatDistanceToNow(new Date(checkpoint.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          <span>
            commit{" "}
            <span className="font-mono text-foreground">
              {checkpoint.commit_hash.slice(0, 8)}
            </span>
          </span>
          {checkpoint.agent && (
            <span>
              agent{" "}
              <span className="text-foreground">{checkpoint.agent}</span>
            </span>
          )}
          <span>
            attribution{" "}
            <span className="font-mono text-accent-light">
              {checkpoint.agent_percent}%
            </span>
          </span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("transcript")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "transcript"
              ? "border-b-2 border-accent text-foreground"
              : "text-muted hover:text-foreground"
          )}
        >
          Transcript
        </button>
        <button
          onClick={() => setActiveTab("diff")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === "diff"
              ? "border-b-2 border-accent text-foreground"
              : "text-muted hover:text-foreground"
          )}
        >
          Diff
        </button>
      </div>

      {activeTab === "transcript" && (
        sessionLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <TranscriptViewer messages={messages || []} />
        )
      )}

      {activeTab === "diff" && (
        diffLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <DiffViewer diff={diff || ""} />
        )
      )}
    </div>
  );
}
