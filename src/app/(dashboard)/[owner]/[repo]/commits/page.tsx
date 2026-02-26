"use client";

import { use, useCallback, useState } from "react";
import { useCommits } from "@/hooks/use-commits";
import { useBranches } from "@/hooks/use-branches";
import { useCheckpoints } from "@/hooks/use-checkpoints";
import { CommitList } from "@/components/repo/commit-list";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function CommitsPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const { branches } = useBranches(owner, repo);
  const [branch, setBranch] = useState<string | undefined>(undefined);

  const defaultBranch = branches?.find((b) => b.isDefault)?.name;
  const selectedBranch = branch ?? defaultBranch;

  const { commits, isLoading } = useCommits(owner, repo, selectedBranch);
  const { checkpoints } = useCheckpoints(owner, repo);

  // Build a lookup: given a full commit SHA, find a matching checkpoint ID
  const findCheckpoint = useCallback(
    (commitSha: string) =>
      checkpoints?.find(
        (cp) =>
          commitSha.startsWith(cp.commit_hash) ||
          cp.commit_hash.startsWith(commitSha)
      )?.id,
    [checkpoints]
  );

  return (
    <div className="space-y-4">
      {/* Branch selector */}
      {branches && branches.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedBranch ?? ""}
            onChange={(e) => setBranch(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-light focus:border-accent focus:outline-none"
          >
            {branches.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
                {b.isDefault ? " (default)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !commits || commits.length === 0 ? (
        <EmptyState
          title="No commits"
          description="No commits found on this branch."
        />
      ) : (
        <CommitList commits={commits} owner={owner} repo={repo} findCheckpoint={findCheckpoint} />
      )}
    </div>
  );
}
