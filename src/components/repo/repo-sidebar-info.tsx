import { Badge } from "@/components/ui/badge";
import { ContributorAvatars } from "./contributor-avatars";
import { formatDistanceToNow } from "date-fns";
import type { RepoDetail, Contributor } from "@/types/repository";

interface RepoSidebarInfoProps {
  repo: RepoDetail;
  contributors?: Contributor[];
  activityChart?: React.ReactNode;
}

function formatSize(sizeKB: number): string {
  if (sizeKB < 1024) return `${sizeKB} KB`;
  return `${(sizeKB / 1024).toFixed(1)} MB`;
}

export function RepoSidebarInfo({ repo, contributors, activityChart }: RepoSidebarInfoProps) {
  return (
    <div className="space-y-5">
      {/* Description */}
      {repo.description && (
        <p className="text-sm text-foreground leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.map((topic) => (
            <Badge key={topic} variant="default" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-light"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open on GitHub
        </a>
      </div>

      {/* Metadata */}
      <div className="space-y-3 border-t border-border pt-4">
        <MetaRow label="Language" value={repo.language ?? "—"} />
        <MetaRow label="License" value={repo.license ?? "None"} />
        <MetaRow label="Default branch" value={repo.default_branch} mono />
        <MetaRow
          label="Last push"
          value={formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true })}
        />
        <MetaRow label="Size" value={formatSize(repo.size)} />
        {repo.homepage && (
          <MetaRow
            label="Homepage"
            value={
              <a
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info hover:underline"
              >
                {repo.homepage.replace(/^https?:\/\//, "")}
              </a>
            }
          />
        )}
      </div>

      {/* Checkpoint activity */}
      {activityChart && (
        <div className="border-t border-border pt-4">{activityChart}</div>
      )}

      {/* Contributors */}
      {contributors && contributors.length > 0 && (
        <div className="space-y-3 border-t border-border pt-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted">
            Contributors
          </h4>
          <ContributorAvatars contributors={contributors} />
        </div>
      )}
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={mono ? "font-mono text-xs text-foreground" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}
