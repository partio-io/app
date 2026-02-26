"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow, format, isSameDay } from "date-fns";
import type { CommitSummary } from "@/types/repository";

interface CommitListProps {
  commits: CommitSummary[];
  owner: string;
  repo: string;
  findCheckpoint?: (sha: string) => string | undefined;
}

export function CommitList({ commits, owner, repo, findCheckpoint }: CommitListProps) {
  const router = useRouter();
  // Group commits by date
  const groups: { date: Date; commits: CommitSummary[] }[] = [];
  for (const commit of commits) {
    const date = new Date(commit.date);
    const existing = groups.find((g) => isSameDay(g.date, date));
    if (existing) {
      existing.commits.push(commit);
    } else {
      groups.push({ date, commits: [commit] });
    }
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date.toISOString()}>
          <h3 className="mb-2 text-xs font-medium text-muted">
            {format(group.date, "MMMM d, yyyy")}
          </h3>
          <div className="space-y-1">
            {group.commits.map((commit) => (
              <div
                key={commit.sha}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/${owner}/${repo}/commits/${commit.sha}`)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/${owner}/${repo}/commits/${commit.sha}`); }}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/30 hover:bg-surface-light"
              >
                <Avatar
                  src={commit.author?.avatar_url}
                  alt={commit.author?.login ?? "Unknown"}
                  size={28}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {commit.message.split("\n")[0]}
                  </p>
                  <p className="text-xs text-muted">
                    {commit.author?.login ?? "Unknown"} committed{" "}
                    {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {commit.sha.slice(0, 7)}
                </span>
                {findCheckpoint?.(commit.sha) && (
                  <Link
                    href={`/${owner}/${repo}/checkpoints/${findCheckpoint(commit.sha)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs text-accent-light transition-colors hover:bg-accent/20"
                  >
                    See Checkpoint
                  </Link>
                )}
                <a
                  href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-light hover:text-foreground"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  See on GitHub
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
