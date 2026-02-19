"use client";

import { use } from "react";
import Link from "next/link";
import { useCheckpoints } from "@/hooks/use-checkpoints";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function RepoDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const { checkpoints, isLoading } = useCheckpoints(owner, repo);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-64" />
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Repositories", href: "/repositories" },
          { label: owner, href: `/repositories` },
          { label: repo },
        ]}
      />

      <h2 className="text-lg font-semibold text-foreground">
        {owner}/{repo}
      </h2>

      {!checkpoints || checkpoints.length === 0 ? (
        <EmptyState
          title="No checkpoints found"
          description="This repository doesn't have any checkpoints on the partio/checkpoints/v1 branch yet."
        />
      ) : (
        <div className="space-y-2">
          {checkpoints.map((cp) => (
            <Link
              key={cp.id}
              href={`/${owner}/${repo}/${cp.id}`}
              className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/30 hover:bg-surface-light"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-foreground">
                    {cp.id}
                  </span>
                  <Badge>{cp.branch}</Badge>
                  {cp.agent && (
                    <span className="text-xs text-muted">{cp.agent}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-accent-light">
                    {cp.agent_percent}%
                  </span>
                  <span className="text-xs text-muted">
                    {formatDistanceToNow(new Date(cp.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 text-xs text-muted">
                commit {cp.commit_hash.slice(0, 8)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
