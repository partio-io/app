import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { DiffViewer } from "@/components/ui/diff-viewer";
import { formatDistanceToNow } from "date-fns";
import type { CommitDetail as CommitDetailType } from "@/types/repository";

interface CommitDetailProps {
  commit: CommitDetailType;
  owner: string;
  repo: string;
  checkpointId?: string;
}

export function CommitDetail({ commit, owner, repo, checkpointId }: CommitDetailProps) {
  // Reconstruct a unified diff from the file patches
  const unifiedDiff = commit.files
    .filter((f) => f.patch)
    .map(
      (f) =>
        `diff --git a/${f.filename} b/${f.filename}\n--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch}`
    )
    .join("\n");

  return (
    <div className="space-y-6">
      {/* Commit info */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-foreground leading-snug">
          {commit.message.split("\n")[0]}
        </h2>

        {commit.message.includes("\n") && (
          <pre className="mt-3 whitespace-pre-wrap text-sm text-muted font-mono">
            {commit.message.split("\n").slice(1).join("\n").trim()}
          </pre>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Avatar
            src={commit.author?.avatar_url}
            alt={commit.author?.login ?? "Unknown"}
            size={24}
          />
          <span className="text-sm text-foreground">
            {commit.author?.login ?? "Unknown"}
          </span>
          <span className="text-sm text-muted">
            committed {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span className="font-mono">{commit.sha.slice(0, 7)}</span>
          {commit.parents.length > 0 && (
            <>
              <span>&middot;</span>
              <span>
                {commit.parents.length} parent{commit.parents.length > 1 ? "s" : ""}
              </span>
            </>
          )}
          <span>&middot;</span>
          <span className="text-success">+{commit.stats.additions}</span>
          <span className="text-red-400">-{commit.stats.deletions}</span>
          <span>&middot;</span>
          <span>{commit.files.length} files changed</span>
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
            href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
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

      {/* Diff */}
      {unifiedDiff && <DiffViewer diff={unifiedDiff} />}
    </div>
  );
}
