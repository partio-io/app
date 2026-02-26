"use client";

import { useRouter } from "next/navigation";
import { useRecentCheckpoints } from "@/hooks/use-recent-commits";
import { DataTable } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { RepoLatestCheckpoint } from "@/types/repository";

export function RecentCommitsTable() {
  const router = useRouter();
  const { items, isLoading } = useRecentCheckpoints();

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <DataTable<RepoLatestCheckpoint>
      data={items}
      onRowClick={(item) =>
        router.push(
          `/${item.owner}/${item.repo}/checkpoints/${item.checkpoint.id}`
        )
      }
      columns={[
        {
          key: "repo",
          header: "Repository",
          render: (item) => (
            <span
              className={cn(
                "text-sm font-medium text-foreground",
                item.commit === null && "opacity-40"
              )}
            >
              {item.owner}/{item.repo}
            </span>
          ),
          className: "w-48",
        },
        {
          key: "message",
          header: "Commit",
          render: (item) => {
            const stale = item.commit === null;
            const text = (() => {
              const msg = item.commit?.message;
              if (msg && /^Implement the following plan/i.test(msg)) {
                // Inline: "Implement the following plan: Title"
                const inline = msg
                  .split("\n")[0]
                  .replace(/^Implement the following plan[:\s]*/i, "")
                  .trim();
                if (inline) return inline;
                // Multi-line: title is a markdown heading in the body
                const heading = msg
                  .split("\n")
                  .find((l) => /^#+\s/.test(l.trim()));
                if (heading) return heading.trim().replace(/^#+\s*/, "");
              }
              return msg?.split("\n")[0] || item.summary || null;
            })();
            return (
              <div className="flex items-center gap-2">
                {stale && (
                  <span className="group/warn relative shrink-0 cursor-help">
                    &#x26A0;&#xFE0F;
                    <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg group-hover/warn:visible">
                      This commit no longer exists &mdash; likely rebased, squashed, or force-pushed
                    </span>
                  </span>
                )}
                {text && (
                  <span
                    className={cn(
                      "truncate text-sm text-foreground",
                      stale && "opacity-40"
                    )}
                  >
                    {text}
                  </span>
                )}
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs text-muted",
                    stale && "opacity-40"
                  )}
                >
                  {item.checkpoint.commit_hash.slice(0, 7)}
                </span>
              </div>
            );
          },
        },
        {
          key: "agent",
          header: "Agent",
          render: (item) => (
            <div
              className={cn(
                "flex items-center gap-2",
                item.commit === null && "opacity-40"
              )}
            >
              <Avatar
                src={item.commit?.author?.avatar_url ?? null}
                alt={item.commit?.author?.login ?? item.checkpoint.agent}
                size={20}
              />
              <span className="whitespace-nowrap text-sm text-muted">
                {item.checkpoint.agent}
              </span>
              <span className="font-mono text-xs text-accent-light">
                {item.checkpoint.agent_percent}%
              </span>
            </div>
          ),
          className: "w-52",
        },
        {
          key: "date",
          header: "When",
          render: (item) => (
            <span
              className={cn(
                "text-sm text-muted",
                item.commit === null && "opacity-40"
              )}
            >
              {formatDistanceToNow(new Date(item.checkpoint.created_at), {
                addSuffix: true,
              })}
            </span>
          ),
          className: "w-36",
        },
      ]}
    />
  );
}
