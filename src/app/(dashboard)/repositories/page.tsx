"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRepos } from "@/hooks/use-repos";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDistanceToNow } from "date-fns";
import type { RepoWithCheckpoints } from "@/types/checkpoint";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  Java: "#b07219",
  "C#": "#178600",
  C: "#555555",
  "C++": "#f34b7d",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
};

export default function RepositoriesPage() {
  const router = useRouter();
  const { repos, isLoading } = useRepos();
  const [search, setSearch] = useState("");
  const [showWithCheckpoints, setShowWithCheckpoints] = useState(false);

  const filtered = (repos ?? [])
    .filter((r) => {
      const matchesSearch = r.full_name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = showWithCheckpoints
        ? r.checkpoint_count > 0
        : true;
      return matchesSearch && matchesFilter;
    });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        All Repositories
      </h2>

      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search repositories..."
          className="w-80"
        />
        <button
          onClick={() => setShowWithCheckpoints(!showWithCheckpoints)}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
            showWithCheckpoints
              ? "border-accent/50 bg-accent/10 text-accent-light"
              : "border-border bg-surface text-muted hover:text-foreground"
          }`}
        >
          With checkpoints
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No repositories found"
          description={
            search
              ? "Try a different search term."
              : "No repositories with checkpoints yet."
          }
        />
      ) : (
        <DataTable<RepoWithCheckpoints>
          data={filtered}
          onRowClick={(r) => router.push(`/${r.owner}/${r.name}`)}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {r.language && (
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            LANGUAGE_COLORS[r.language] || "#6e7681",
                        }}
                      />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {r.full_name}
                    </span>
                  </div>
                  {r.stars > 0 && (
                    <span className="text-xs text-muted">{r.stars}</span>
                  )}
                </div>
              ),
            },
            {
              key: "issues",
              header: "Issues",
              render: (r) => (
                <span className="text-sm text-muted">
                  {r.open_issues_count}
                </span>
              ),
              className: "w-24",
            },
            {
              key: "checkpoints",
              header: "Checkpoints",
              render: (r) => (
                <span className="font-mono text-sm text-foreground">
                  {r.checkpoint_count}
                </span>
              ),
              className: "w-32",
            },
            {
              key: "updated",
              header: "Updated",
              render: (r) => (
                <span className="text-sm text-muted">
                  {formatDistanceToNow(new Date(r.updated_at), {
                    addSuffix: true,
                  })}
                </span>
              ),
              className: "w-36",
            },
          ]}
        />
      )}
    </div>
  );
}
