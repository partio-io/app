"use client";

import { cn } from "@/lib/utils";

interface StateFilterProps {
  state: "open" | "closed";
  onChange: (state: "open" | "closed") => void;
  openLabel?: string;
  closedLabel?: string;
}

export function StateFilter({
  state,
  onChange,
  openLabel = "Open",
  closedLabel = "Closed",
}: StateFilterProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface">
      <button
        onClick={() => onChange("open")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
          state === "open"
            ? "bg-accent/10 text-accent-light"
            : "text-muted hover:text-foreground"
        )}
      >
        {openLabel}
      </button>
      <button
        onClick={() => onChange("closed")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer border-l border-border",
          state === "closed"
            ? "bg-accent/10 text-accent-light"
            : "text-muted hover:text-foreground"
        )}
      >
        {closedLabel}
      </button>
    </div>
  );
}
