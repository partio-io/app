"use client";

import Link from "next/link";
import { useRecentCheckpoints } from "@/hooks/use-recent-commits";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function commitText(item: {
  commit: { message: string } | null;
  summary: string | null;
}): string | null {
  const msg = item.commit?.message;
  if (msg && /^Implement the following plan/i.test(msg)) {
    const inline = msg
      .split("\n")[0]
      .replace(/^Implement the following plan[:\s]*/i, "")
      .trim();
    if (inline) return inline;
    const heading = msg
      .split("\n")
      .find((l) => /^#+\s/.test(l.trim()));
    if (heading) return heading.trim().replace(/^#+\s*/, "");
  }
  return msg?.split("\n")[0] || item.summary || null;
}

export function RecentCommitsTable() {
  const { items, isLoading } = useRecentCheckpoints();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const stale = item.commit === null;
        const text = commitText(item);
        return (
          <Link
            key={`${item.owner}/${item.repo}/${item.checkpoint.id}`}
            href={`/${item.owner}/${item.repo}/checkpoints/${item.checkpoint.id}`}
            className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/30 hover:bg-surface-light"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm font-medium text-foreground",
                  stale && "opacity-40"
                )}
              >
                {item.owner}/{item.repo}
              </span>
              <Badge>{item.checkpoint.branch}</Badge>
              <span className="flex-1" />
              <span className="whitespace-nowrap text-xs text-muted">
                {formatDistanceToNow(new Date(item.checkpoint.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
              <span className={cn("font-mono", stale && "opacity-40")}>
                {item.checkpoint.commit_hash.slice(0, 8)}
              </span>
              {stale && (
                <span className="group/warn relative shrink-0 cursor-help">
                  &#x26A0;&#xFE0F;
                  <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg group-hover/warn:visible">
                    This commit no longer exists &mdash; likely rebased, squashed, or force-pushed
                  </span>
                </span>
              )}
              {text && (
                <>
                  <span>&middot;</span>
                  <span className={cn("truncate", stale && "opacity-40")}>
                    {text}
                  </span>
                </>
              )}
              <span className="flex-1" />
              <div
                className={cn(
                  "flex shrink-0 items-center gap-2",
                  stale && "opacity-40"
                )}
              >
                <Avatar
                  src={item.commit?.author?.avatar_url ?? null}
                  alt={item.commit?.author?.login ?? item.checkpoint.agent}
                  size={18}
                />
                <span className="whitespace-nowrap text-xs text-muted">
                  {item.checkpoint.agent}
                </span>
                <span className="font-mono text-xs text-accent-light">
                  {item.checkpoint.agent_percent}%
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
