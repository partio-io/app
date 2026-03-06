"use client";

import { useSession } from "next-auth/react";
import { useRecentCheckpoints } from "@/hooks/use-recent-commits";
import { OverviewStatsRow } from "@/components/ui/overview-stats";
import { Heatmap } from "@/components/ui/heatmap";
import { EmptyState } from "@/components/ui/empty-state";
import { SquirrelLoader } from "@/components/ui/squirrel-loader";
import { RecentCommitsTable } from "@/components/repo/recent-commits-table";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const { items, heatmap, stats, isLoading } = useRecentCheckpoints();

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const heatmapData = heatmap ?? {};
  const hasCheckpoints = (items?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">
        {getGreeting()}, {firstName}
      </h2>

      {isLoading ? (
        <SquirrelLoader message="Fetching your dashboard..." />
      ) : (
        <>
          {stats && <OverviewStatsRow stats={stats} />}

          <Heatmap data={heatmapData} />

          {hasCheckpoints && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted">Recent Activity</h3>
              <RecentCommitsTable />
            </div>
          )}

          {!hasCheckpoints && (
            <EmptyState
              title="No checkpoints yet"
              description="Run partio commit in a repo to capture your first checkpoint."
            />
          )}
        </>
      )}
    </div>
  );
}
