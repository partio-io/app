"use client";

import { use } from "react";
import { useContents } from "@/hooks/use-contents";
import { FileTree } from "@/components/repo/file-tree";
import { FileViewer } from "@/components/repo/file-viewer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function CodePathPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; path?: string[] }>;
}) {
  const { owner, repo, path } = use(params);
  const filePath = path?.join("/") ?? "";
  const { contents, isLoading, isError } = useContents(owner, repo, filePath);

  // Build breadcrumb items
  const pathParts = filePath.split("/").filter(Boolean);
  const breadcrumbItems = [
    { label: repo, href: `/${owner}/${repo}/code` },
    ...pathParts.map((part, i) => ({
      label: part,
      href:
        i < pathParts.length - 1
          ? `/${owner}/${repo}/code/${pathParts.slice(0, i + 1).join("/")}`
          : undefined,
    })),
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !contents) {
    return <EmptyState title="Not found" description="The requested path could not be found." />;
  }

  return (
    <div className="space-y-4">
      {pathParts.length > 0 && <Breadcrumb items={breadcrumbItems} />}

      {contents.type === "dir" ? (
        <FileTree
          entries={contents.entries}
          owner={owner}
          repo={repo}
          currentPath={filePath}
        />
      ) : (
        <FileViewer file={contents.file} owner={owner} repo={repo} />
      )}
    </div>
  );
}
