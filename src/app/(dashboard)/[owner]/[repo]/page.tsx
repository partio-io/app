"use client";

import { use, useMemo } from "react";
import { useRepoDetail } from "@/hooks/use-repo-detail";
import { useContributors } from "@/hooks/use-contributors";
import { useCheckpoints } from "@/hooks/use-checkpoints";
import { usePulls } from "@/hooks/use-pulls";
import { Skeleton } from "@/components/ui/skeleton";
import { SquirrelLoader } from "@/components/ui/squirrel-loader";
import { Badge } from "@/components/ui/badge";
import { RepoSidebarInfo } from "@/components/repo/repo-sidebar-info";
import { ActivityChart } from "@/components/repo/activity-chart";
import { OpenPRsList } from "@/components/repo/open-prs-list";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { WeeklyActivity } from "@/types/repository";

export default function OverviewPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const { repo: repoDetail, isLoading: repoLoading } = useRepoDetail(
    owner,
    repo
  );
  const { contributors } = useContributors(owner, repo);
  const { checkpoints, isLoading: checkpointsLoading } = useCheckpoints(
    owner,
    repo
  );
  const { pulls } = usePulls(owner, repo, "open");

  // Build weekly checkpoint activity from checkpoint dates
  const checkpointActivity: WeeklyActivity[] = useMemo(() => {
    if (!checkpoints || checkpoints.length === 0) return [];
    const weeks: Record<number, number> = {};
    for (const cp of checkpoints) {
      const date = new Date(cp.created_at);
      const day = date.getDay();
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - day);
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = Math.floor(weekStart.getTime() / 1000);
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    }
    return Object.entries(weeks)
      .map(([week, total]) => ({ week: Number(week), total, days: [] }))
      .sort((a, b) => a.week - b.week);
  }, [checkpoints]);

  const recentCheckpoints = checkpoints?.slice(0, 10) ?? [];

  if (repoLoading) {
    return <SquirrelLoader message="Loading repository..." />;
  }

  if (!repoDetail) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
        Failed to load repository details
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <RepoSidebarInfo
          repo={repoDetail}
          contributors={contributors}
          activityChart={
            checkpointsLoading ? (
              <Skeleton className="h-20" />
            ) : (
              <ActivityChart activity={checkpointActivity} />
            )
          }
        />
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Recent checkpoints */}
        {recentCheckpoints.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
              Recent Checkpoints
            </h3>
            <div className="space-y-2">
              {recentCheckpoints.map((cp) => (
                <Link
                  key={cp.id}
                  href={`/${owner}/${repo}/checkpoints/${cp.id}`}
                  className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/30 hover:bg-surface-light"
                >
                  <div className="flex items-center gap-3">
                    <Badge>{cp.branch}</Badge>
                    <span className="font-mono text-xs text-muted">
                      {cp.commit_hash.slice(0, 8)}
                    </span>
                    <span className="flex-1" />
                    <span className="whitespace-nowrap text-xs text-muted">
                      {formatDistanceToNow(new Date(cp.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                    <span className="text-sm font-medium text-foreground">
                      {cp.agent}
                    </span>
                    <span className="font-mono text-xs text-accent-light">
                      {cp.agent_percent}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Open PRs */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            Open Pull Requests
          </h3>
          {pulls ? (
            <OpenPRsList pulls={pulls} owner={owner} repo={repo} />
          ) : (
            <Skeleton className="h-32" />
          )}
        </div>
      </div>
    </div>
  );
}
