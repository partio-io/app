import type { OverviewStats } from "@/types/checkpoint";
import { StatCard } from "@/components/ui/stat-card";

interface OverviewStatsRowProps {
  stats: OverviewStats;
}

export function OverviewStatsRow({ stats }: OverviewStatsRowProps) {
  const weekTrend =
    stats.prev_week > 0
      ? Math.round(
          ((stats.this_week - stats.prev_week) / stats.prev_week) * 100
        )
      : stats.this_week > 0
        ? 100
        : 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard
        label="Total Checkpoints"
        value={stats.total_checkpoints}
        subtitle={`across ${stats.active_repos} repo${stats.active_repos !== 1 ? "s" : ""}`}
      />
      <StatCard
        label="This Week"
        value={stats.this_week}
        trend={weekTrend}
      />
      <StatCard
        label="Avg AI Authorship"
        value={`${stats.avg_agent_percent}%`}
      />
      <StatCard
        label="Active Streak"
        value={stats.streak_days}
        unit={stats.streak_days === 1 ? "day" : "days"}
      />
    </div>
  );
}
