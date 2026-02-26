import type { WeeklyActivity } from "@/types/repository";

interface ActivityChartProps {
  activity: WeeklyActivity[];
  title?: string;
  weeks?: number;
}

export function ActivityChart({
  activity,
  title = "Checkpoint Activity",
  weeks = 16,
}: ActivityChartProps) {
  const recent = activity.slice(-weeks);
  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
        No checkpoint activity data available
      </div>
    );
  }

  const maxTotal = Math.max(...recent.map((w) => w.total), 1);
  const chartHeight = 40;

  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
        {title}
      </h3>
      <svg
        viewBox={`0 0 ${recent.length * 20} ${chartHeight}`}
        className="h-10 w-full"
        preserveAspectRatio="xMinYMax meet"
      >
        {recent.map((week, i) => {
          const height = Math.max(
            (week.total / maxTotal) * (chartHeight - 12),
            week.total > 0 ? 4 : 0
          );
          const x = i * 20 + 2;
          const y = chartHeight - height;
          return (
            <g key={week.week}>
              <rect
                x={x}
                y={y}
                width={16}
                height={height}
                rx={2}
                className="fill-accent/60 transition-colors hover:fill-accent"
              />
              {week.total > 0 && (
                <text
                  x={x + 8}
                  y={y - 2}
                  textAnchor="middle"
                  className="fill-muted"
                  style={{ fontSize: 7 }}
                >
                  {week.total}
                </text>
              )}
              <title>
                {new Date(week.week * 1000).toLocaleDateString()}:{" "}
                {week.total} checkpoint{week.total !== 1 ? "s" : ""}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
