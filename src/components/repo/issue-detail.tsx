import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LabelBadge } from "./label-badge";
import { MarkdownBody } from "./markdown-body";
import { formatDistanceToNow } from "date-fns";
import type { IssueDetail as IssueDetailType } from "@/types/repository";

interface IssueDetailProps {
  issue: IssueDetailType;
}

export function IssueDetail({ issue }: IssueDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {issue.title}
            <span className="ml-2 text-muted font-normal">#{issue.number}</span>
          </h2>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant={issue.state === "open" ? "success" : "purple"}>
            {issue.state === "open" ? "Open" : "Closed"}
          </Badge>
          <span className="text-sm text-muted">
            <span className="text-foreground">{issue.user.login}</span> opened this issue{" "}
            {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
            {" "}&middot; {issue.comments} comment{issue.comments !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center gap-3">
              <Avatar src={issue.user.avatar_url} alt={issue.user.login} size={28} />
              <div>
                <span className="text-sm font-medium text-foreground">{issue.user.login}</span>
                <span className="ml-2 text-xs text-muted">
                  commented {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            {issue.body ? (
              <MarkdownBody content={issue.body} />
            ) : (
              <p className="text-sm text-muted italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 space-y-4 lg:block">
          {/* Labels */}
          {issue.labels.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Labels</h4>
              <div className="flex flex-wrap gap-1">
                {issue.labels.map((label) => (
                  <LabelBadge key={label.id} label={label} />
                ))}
              </div>
            </div>
          )}

          {/* Assignees */}
          {issue.assignees.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Assignees</h4>
              <div className="space-y-2">
                {issue.assignees.map((a) => (
                  <div key={a.login} className="flex items-center gap-2">
                    <Avatar src={a.avatar_url} alt={a.login} size={20} />
                    <span className="text-sm text-foreground">{a.login}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestone */}
          {issue.milestone && (
            <div className="border-t border-border pt-4">
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Milestone</h4>
              <span className="text-sm text-foreground">{issue.milestone.title}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
