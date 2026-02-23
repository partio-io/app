"use client";

import { use } from "react";
import Link from "next/link";
import { useCommit } from "@/hooks/use-commits";
import { useCheckpoints } from "@/hooks/use-checkpoints";
import { CommitDetail } from "@/components/repo/commit-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function CommitDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; sha: string }>;
}) {
  const { owner, repo, sha } = use(params);
  const { commit, isLoading } = useCommit(owner, repo, sha);
  const { checkpoints } = useCheckpoints(owner, repo);
  const checkpointId = checkpoints?.find(
    (cp) => sha.startsWith(cp.commit_hash) || cp.commit_hash.startsWith(sha)
  )?.id;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!commit) {
    return <EmptyState title="Commit not found" description={`Could not find commit ${sha.slice(0, 7)}.`} />;
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/${owner}/${repo}/commits`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        All commits
      </Link>
      <CommitDetail commit={commit} owner={owner} repo={repo} checkpointId={checkpointId} />
    </div>
  );
}
