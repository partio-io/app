"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { LabelBadge } from "./label-badge";
import { StateFilter } from "./state-filter";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useIssues } from "@/hooks/use-issues";

interface IssueListProps {
  owner: string;
  repo: string;
}

function IssueIcon({ state }: { state: string }) {
  if (state === "closed") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className="text-purple-pr shrink-0">
        <path fill="currentColor" d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="text-success shrink-0">
      <path fill="currentColor" d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  );
}

export function IssueList({ owner, repo }: IssueListProps) {
  const [state, setState] = useState<"open" | "closed">("open");
  const { issues, isLoading } = useIssues(owner, repo, state);

  return (
    <div className="space-y-4">
      <StateFilter state={state} onChange={setState} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !issues || issues.length === 0 ? (
        <EmptyState
          title={`No ${state} issues`}
          description={`There are no ${state} issues in this repository.`}
        />
      ) : (
        <div className="space-y-1">
          {issues.map((issue) => (
            <Link
              key={issue.number}
              href={`/${owner}/${repo}/issues/${issue.number}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/30 hover:bg-surface-light"
            >
              <IssueIcon state={issue.state} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {issue.title}
                  </span>
                  {issue.labels.map((label) => (
                    <LabelBadge key={label.id} label={label} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted">
                  #{issue.number} opened {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })} by {issue.user.login}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Avatar src={issue.user.avatar_url} alt={issue.user.login} size={20} />
                {issue.comments > 0 && (
                  <span className="text-xs text-muted">{issue.comments}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
