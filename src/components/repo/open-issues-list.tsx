import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { IssueSummary } from "@/types/repository";

interface OpenIssuesListProps {
  issues: IssueSummary[];
  owner: string;
  repo: string;
  max?: number;
}

export function OpenIssuesList({ issues, owner, repo, max = 5 }: OpenIssuesListProps) {
  const visible = issues.slice(0, max);

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted">No open issues</p>
    );
  }

  return (
    <div className="space-y-1">
      {visible.map((issue) => (
        <Link
          key={issue.number}
          href={`/${owner}/${repo}/issues/${issue.number}`}
          className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-light"
        >
          <Avatar src={issue.user.avatar_url} alt={issue.user.login} size={24} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">
              {issue.title}
            </p>
            <p className="text-xs text-muted">
              #{issue.number} &middot; {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
