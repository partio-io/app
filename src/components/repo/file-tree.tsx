import Link from "next/link";
import type { TreeEntry } from "@/types/repository";

interface FileTreeProps {
  entries: TreeEntry[];
  owner: string;
  repo: string;
  currentPath?: string;
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileTree({ entries, owner, repo, currentPath }: FileTreeProps) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-light">
            <th className="px-4 py-2 text-left text-xs font-medium text-muted">Name</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-muted">
              <a
                href={`https://github.com/${owner}/${repo}${currentPath ? `/tree/HEAD/${currentPath}` : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                See on GitHub
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentPath && (
            <tr className="border-b border-border hover:bg-surface-light transition-colors">
              <td className="px-4 py-2" colSpan={2}>
                <Link
                  href={`/${owner}/${repo}/code/${currentPath.split("/").slice(0, -1).join("/")}`}
                  className="inline-flex items-center gap-2 text-foreground hover:text-info"
                >
                  <span className="text-muted">..</span>
                </Link>
              </td>
            </tr>
          )}
          {entries.map((entry) => (
            <tr key={entry.path} className="border-b border-border last:border-0 hover:bg-surface-light transition-colors">
              <td className="px-4 py-2">
                <Link
                  href={`/${owner}/${repo}/code/${entry.path}`}
                  className="inline-flex items-center gap-2 text-foreground hover:text-info"
                >
                  {entry.type === "dir" ? <FolderIcon /> : <FileIcon />}
                  {entry.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-right text-xs text-muted">
                {entry.type === "file" ? formatFileSize(entry.size) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
