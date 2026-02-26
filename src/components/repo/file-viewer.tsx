"use client";

import { useEffect, useState } from "react";
import type { FileContent } from "@/types/repository";

interface FileViewerProps {
  file: FileContent;
  owner: string;
  repo: string;
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    rb: "ruby",
    rs: "rust",
    go: "go",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    php: "php",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    xml: "xml",
    md: "markdown",
    mdx: "mdx",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    dockerfile: "dockerfile",
    makefile: "makefile",
    vue: "vue",
    svelte: "svelte",
    graphql: "graphql",
    gql: "graphql",
  };
  return map[ext] || "text";
}

export function FileViewer({ file, owner, repo }: FileViewerProps) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const lang = getLanguageFromFilename(file.name);
        const result = await codeToHtml(file.content, {
          lang,
          theme: "github-dark-default",
        });
        if (!cancelled) setHtml(result);
      } catch {
        // Fallback: render as plain text
        if (!cancelled) {
          setHtml("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    highlight();
    return () => { cancelled = true; };
  }, [file.content, file.name]);

  const lines = file.content.split("\n");

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* File header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-light px-4 py-2">
        <span className="text-sm text-foreground font-mono">{file.name}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {lines.length} lines &middot; {formatSize(file.size)}
          </span>
          <a
            href={`https://github.com/${owner}/${repo}/blob/HEAD/${file.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            See on GitHub
          </a>
        </div>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        {loading ? (
          <pre className="p-4 text-sm font-mono text-foreground">
            <code>{file.content}</code>
          </pre>
        ) : html ? (
          <div
            className="shiki-container text-sm [&_pre]:!bg-transparent [&_pre]:p-4 [&_code]:!text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="p-4 text-sm font-mono text-foreground">
            <code>{file.content}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
