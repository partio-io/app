"use client";

import { use } from "react";
import Link from "next/link";
import { usePullRequest } from "@/hooks/use-pulls";
import { useCheckpoints } from "@/hooks/use-checkpoints";
import { PRDetail } from "@/components/repo/pr-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function PullRequestPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; number: string }>;
}) {
  const { owner, repo, number } = use(params);
  const { pr, isLoading } = usePullRequest(owner, repo, parseInt(number, 10));
  const { checkpoints } = useCheckpoints(owner, repo);
  const checkpointId = pr
    ? checkpoints?.find((cp) => cp.branch === pr.head.ref)?.id
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!pr) {
    return <EmptyState title="PR not found" description={`Pull request #${number} could not be found.`} />;
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/${owner}/${repo}/pulls`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        All pull requests
      </Link>
      <PRDetail pr={pr} owner={owner} repo={repo} checkpointId={checkpointId} />
    </div>
  );
}
