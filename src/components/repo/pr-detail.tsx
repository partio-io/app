import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LabelBadge } from "./label-badge";
import { MarkdownBody } from "./markdown-body";
import { formatDistanceToNow } from "date-fns";
import type { PullRequestDetail as PRDetailType } from "@/types/repository";

interface PRDetailProps {
  pr: PRDetailType;
  owner: string;
  repo: string;
  checkpointId?: string;
}

function prStatusVariant(pr: PRDetailType): "success" | "danger" | "purple" | "muted" {
  if (pr.merged) return "purple";
  if (pr.draft) return "muted";
  if (pr.state === "closed") return "danger";
  return "success";
}

function prStatusLabel(pr: PRDetailType): string {
  if (pr.merged) return "Merged";
  if (pr.draft) return "Draft";
  if (pr.state === "closed") return "Closed";
  return "Open";
}

export function PRDetail({ pr, owner, repo, checkpointId }: PRDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {pr.title}
            <span className="ml-2 text-muted font-normal">#{pr.number}</span>
          </h2>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={prStatusVariant(pr)}>
            {prStatusLabel(pr)}
          </Badge>

          <span className="text-sm text-muted">
            <span className="text-foreground">{pr.user.login}</span> wants to merge{" "}
            {pr.commits} commit{pr.commits !== 1 ? "s" : ""} into{" "}
            <span className="rounded-md bg-surface-light border border-border px-1.5 py-0.5 font-mono text-xs text-info">
              {pr.base.ref}
            </span>{" "}
            from{" "}
            <span className="rounded-md bg-surface-light border border-border px-1.5 py-0.5 font-mono text-xs text-info">
              {pr.head.ref}
            </span>
          </span>
          <span className="flex-1" />
          {checkpointId && (
            <Link
              href={`/${owner}/${repo}/checkpoints/${checkpointId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-light transition-colors hover:bg-accent/20"
            >
              See Checkpoint
            </Link>
          )}
          <a
            href={`https://github.com/${owner}/${repo}/pull/${pr.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-light"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            See on GitHub
          </a>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* PR body */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <Avatar src={pr.user.avatar_url} alt={pr.user.login} size={28} />
              <div>
                <span className="text-sm font-medium text-foreground">{pr.user.login}</span>
                <span className="ml-2 text-xs text-muted">
                  commented {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            {pr.body ? (
              <MarkdownBody content={pr.body} />
            ) : (
              <p className="text-sm text-muted italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 space-y-4 lg:block">
          {/* Labels */}
          {pr.labels.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Labels</h4>
              <div className="flex flex-wrap gap-1">
                {pr.labels.map((label) => (
                  <LabelBadge key={label.id} label={label} />
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Commits</span>
              <span className="text-foreground">{pr.commits}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Changed files</span>
              <span className="text-foreground">{pr.changed_files}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Additions</span>
              <span className="text-success">+{pr.additions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Deletions</span>
              <span className="text-red-400">-{pr.deletions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Comments</span>
              <span className="text-foreground">{pr.comments + pr.review_comments}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
