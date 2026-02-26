"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LabelBadge } from "./label-badge";
import { StateFilter } from "./state-filter";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePulls } from "@/hooks/use-pulls";

interface PRListProps {
  owner: string;
  repo: string;
  findCheckpoint?: (branch: string) => string | undefined;
}

function PRStatusIcon({ merged, draft, state }: { merged: boolean; draft: boolean; state: string }) {
  if (merged) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className="text-purple-pr shrink-0">
        <path fill="currentColor" d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 5.846V9.5a2.25 2.25 0 1 1-1.5 0V5.154a2.25 2.25 0 1 1 1.95 0Z" />
      </svg>
    );
  }

  if (state === "closed") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className="text-danger shrink-0">
        <path fill="currentColor" d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Z" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={`${draft ? "text-muted" : "text-success"} shrink-0`}>
      <path fill="currentColor" d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm9.5 1.064v5.256a2.25 2.25 0 1 1-1.5 0V4.314A3.21 3.21 0 0 1 8 2.25a.75.75 0 0 1 1.5 0 1.71 1.71 0 0 0 .833 1.456A2.25 2.25 0 0 1 14 3.25a.75.75 0 0 1-1.5 0 .75.75 0 0 0-1.5 0v1.064Z" />
    </svg>
  );
}

export function PRList({ owner, repo, findCheckpoint }: PRListProps) {
  const router = useRouter();
  const [state, setState] = useState<"open" | "closed">("open");
  const { pulls, isLoading } = usePulls(owner, repo, state);

  return (
    <div className="space-y-4">
      <StateFilter state={state} onChange={setState} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !pulls || pulls.length === 0 ? (
        <EmptyState
          title={`No ${state} pull requests`}
          description={`There are no ${state} pull requests in this repository.`}
        />
      ) : (
        <div className="space-y-1">
          {pulls.map((pr) => (
            <div
              key={pr.number}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/${owner}/${repo}/pulls/${pr.number}`)}
              onKeyDown={(e) => { if (e.key === "Enter") router.push(`/${owner}/${repo}/pulls/${pr.number}`); }}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/30 hover:bg-surface-light"
            >
              <PRStatusIcon merged={pr.merged} draft={pr.draft} state={pr.state} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {pr.title}
                  </span>
                  {pr.labels.map((label) => (
                    <LabelBadge key={label.id} label={label} />
                  ))}
                  {pr.draft && <Badge variant="muted">Draft</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted">
                  #{pr.number} opened {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })} by {pr.user.login}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Avatar src={pr.user.avatar_url} alt={pr.user.login} size={20} />
                {pr.comments > 0 && (
                  <span className="text-xs text-muted">{pr.comments}</span>
                )}
              </div>
              {findCheckpoint?.(pr.head.ref) && (
                <Link
                  href={`/${owner}/${repo}/checkpoints/${findCheckpoint(pr.head.ref)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs text-accent-light transition-colors hover:bg-accent/20"
                >
                  See Checkpoint
                </Link>
              )}
              <a
                href={`https://github.com/${owner}/${repo}/pull/${pr.number}`}
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
      )}
    </div>
  );
}
