"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRepoDetail } from "@/hooks/use-repo-detail";
import { useCheckpoints } from "@/hooks/use-checkpoints";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  href: string;
  count?: number;
  match: (pathname: string) => boolean;
}

export default function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const { repo: repoDetail, isLoading } = useRepoDetail(owner, repo);
  const { checkpoints } = useCheckpoints(owner, repo);

  const basePath = `/${owner}/${repo}`;

  const tabs: Tab[] = [
    {
      label: "Overview",
      href: basePath,
      match: (p) => p === basePath,
    },
    {
      label: "Checkpoints",
      href: `${basePath}/checkpoints`,
      count: checkpoints?.length,
      match: (p) => p.startsWith(`${basePath}/checkpoints`),
    },
    {
      label: "Commits",
      href: `${basePath}/commits`,
      match: (p) => p.startsWith(`${basePath}/commits`),
    },
    {
      label: "PRs",
      href: `${basePath}/pulls`,
      match: (p) => p.startsWith(`${basePath}/pulls`),
    },
    {
      label: "Code",
      href: `${basePath}/code`,
      match: (p) => p.startsWith(`${basePath}/code`),
    },
  ];

  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Repo header */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : (
          <Avatar
            src={repoDetail?.avatar_url}
            alt={owner}
            size={32}
          />
        )}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <>
              <Link
                href="/repositories"
                className="text-lg text-info hover:underline"
              >
                {owner}
              </Link>
              <span className="text-lg text-muted">/</span>
              <Link
                href={basePath}
                className="text-lg font-semibold text-info hover:underline"
              >
                {repo}
              </Link>
              <Badge variant="muted">
                {repoDetail?.private ? "Private" : "Public"}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                    active
                      ? "bg-accent/20 text-accent-light"
                      : "bg-surface-light text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
