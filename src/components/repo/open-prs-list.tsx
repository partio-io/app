import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { PullRequestSummary } from "@/types/repository";

interface OpenPRsListProps {
  pulls: PullRequestSummary[];
  owner: string;
  repo: string;
  max?: number;
}

export function OpenPRsList({ pulls, owner, repo, max = 5 }: OpenPRsListProps) {
  const visible = pulls.slice(0, max);

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted">No open pull requests</p>
    );
  }

  return (
    <div className="space-y-1">
      {visible.map((pr) => (
        <Link
          key={pr.number}
          href={`/${owner}/${repo}/pulls/${pr.number}`}
          className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-light"
        >
          <Avatar src={pr.user.avatar_url} alt={pr.user.login} size={24} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">
              {pr.title}
            </p>
            <p className="text-xs text-muted">
              #{pr.number} &middot; {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
