"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useCheckpoints, usePlan } from "@/hooks/use-checkpoints";
import { useCommits } from "@/hooks/use-commits";
import { SquirrelLoader } from "@/components/ui/squirrel-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

function PlanTitle({ owner, repo, checkpointId }: { owner: string; repo: string; checkpointId: string }) {
  const { plan } = usePlan(owner, repo, checkpointId);
  if (!plan) return null;
  const heading = plan.split("\n").find((l) => /^#+\s/.test(l));
  const title = heading?.replace(/^#+\s*/, "").trim();
  if (!title) return null;
  return (
    <>
      <span className="truncate text-foreground/60">{title}</span>
      <span>&middot;</span>
    </>
  );
}

export default function CheckpointsPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const { checkpoints, isLoading } = useCheckpoints(owner, repo);
  const { commits } = useCommits(owner, repo);

  // Map commit SHA prefix → commit message
  const commitMessages = useMemo(() => {
    const map = new Map<string, string>();
    if (commits) {
      for (const c of commits) {
        map.set(c.sha, c.message.split("\n")[0]);
      }
    }
    return map;
  }, [commits]);

  function findCommitMessage(commitHash: string): string | undefined {
    // Try exact match first, then prefix match
    const exact = commitMessages.get(commitHash);
    if (exact) return exact;
    for (const [sha, msg] of commitMessages) {
      if (sha.startsWith(commitHash) || commitHash.startsWith(sha)) {
        return msg;
      }
    }
    return undefined;
  }

  if (isLoading) {
    return <SquirrelLoader message="Loading checkpoints..." />;
  }

  if (!checkpoints || checkpoints.length === 0) {
    return (
      <EmptyState
        title="No checkpoints found"
        description="This repository doesn't have any checkpoints on the partio/checkpoints/v1 branch yet."
      />
    );
  }

  return (
    <div className="space-y-2">
      {checkpoints.map((cp) => {
        const message = findCommitMessage(cp.commit_hash);
        return (
          <Link
            key={cp.id}
            href={`/${owner}/${repo}/checkpoints/${cp.id}`}
            className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/30 hover:bg-surface-light"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-foreground">
                {cp.id}
              </span>
              <Badge>{cp.branch}</Badge>
              <span className="flex-1" />
              <span className="whitespace-nowrap text-xs text-muted">
                {formatDistanceToNow(new Date(cp.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
              <span className="font-mono">
                {cp.commit_hash.slice(0, 8)}
              </span>
              <span>&middot;</span>
              {message ? (
                <span className="truncate">{message}</span>
              ) : commits ? (
                <>
                  {cp.plan_slug && (
                    <PlanTitle owner={owner} repo={repo} checkpointId={cp.id} />
                  )}
                  <span className="truncate opacity-40">
                    Commit no longer exists &mdash; likely rebased, squashed, or force-pushed
                  </span>
                </>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
