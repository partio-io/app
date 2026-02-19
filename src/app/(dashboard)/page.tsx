"use client";

import { useSession } from "next-auth/react";
import { useRepos } from "@/hooks/use-repos";
import { StatCard } from "@/components/ui/stat-card";
import { Heatmap } from "@/components/ui/heatmap";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const { repos, isLoading } = useRepos();

  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const totalCheckpoints = repos?.reduce((sum, r) => sum + r.checkpoint_count, 0) ?? 0;
  const reposWithCheckpoints = repos?.filter((r) => r.checkpoint_count > 0).length ?? 0;

  // Build heatmap data from repo updated_at as a proxy (real data would come from checkpoints)
  const heatmapData: Record<string, number> = {};
  if (repos) {
    for (const repo of repos) {
      if (repo.checkpoint_count > 0) {
        const date = repo.updated_at.split("T")[0];
        heatmapData[date] = (heatmapData[date] || 0) + repo.checkpoint_count;
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">
        {getGreeting()}, {firstName}
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Checkpoints" value={totalCheckpoints} />
        <StatCard label="Repositories" value={reposWithCheckpoints} />
        <StatCard
          label="Total Repos"
          value={repos?.length ?? 0}
        />
        <StatCard
          label="Streak"
          value={Object.keys(heatmapData).length}
          unit="days"
        />
      </div>

      <Heatmap data={heatmapData} />

      {totalCheckpoints === 0 && (
        <EmptyState
          title="No checkpoints yet"
          description="Run partio commit in a repo to capture your first checkpoint."
        />
      )}
    </div>
  );
}
