"use client";

import { cn } from "@/lib/utils";

interface HeatmapProps {
  data: Record<string, number>;
  className?: string;
}

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return "bg-surface-light";
  const ratio = count / max;
  if (ratio < 0.25) return "bg-accent-dark/30";
  if (ratio < 0.5) return "bg-accent-dark/50";
  if (ratio < 0.75) return "bg-accent/70";
  return "bg-accent";
}

export function Heatmap({ data, className }: HeatmapProps) {
  const today = new Date();
  const days = 91; // ~13 weeks
  const cells: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    cells.push({ date: key, count: data[key] || 0 });
  }

  const maxCount = Math.max(...cells.map((c) => c.count), 1);

  // Group by week (columns)
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  for (const cell of cells) {
    const dayOfWeek = new Date(cell.date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
        Activity
      </p>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.date}
                className={cn(
                  "h-3 w-3 rounded-sm transition-colors",
                  getIntensityClass(cell.count, maxCount)
                )}
                title={`${cell.date}: ${cell.count} checkpoint${cell.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-surface-light" />
        <div className="h-3 w-3 rounded-sm bg-accent-dark/30" />
        <div className="h-3 w-3 rounded-sm bg-accent-dark/50" />
        <div className="h-3 w-3 rounded-sm bg-accent/70" />
        <div className="h-3 w-3 rounded-sm bg-accent" />
        <span>More</span>
      </div>
    </div>
  );
}
