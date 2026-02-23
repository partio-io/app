import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: number;
  className?: string;
}

export function StatCard({ label, value, unit, subtitle, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-semibold text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              "ml-1 text-xs font-medium",
              trend > 0 ? "text-green-400" : "text-red-400"
            )}
          >
            {trend > 0 ? "\u2191" : "\u2193"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
      )}
    </div>
  );
}
