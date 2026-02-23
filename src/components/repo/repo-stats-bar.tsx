import { StatCard } from "@/components/ui/stat-card";
import type { RepoDetail } from "@/types/repository";

interface RepoStatsBarProps {
  repo: RepoDetail;
  openPRs?: number;
  openIssues?: number;
}

export function RepoStatsBar({ repo, openPRs, openIssues }: RepoStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Stars" value={repo.stargazers_count.toLocaleString()} />
      <StatCard label="Forks" value={repo.forks_count.toLocaleString()} />
      <StatCard label="Watchers" value={repo.watchers_count.toLocaleString()} />
      <StatCard
        label="Open PRs"
        value={openPRs !== undefined ? openPRs.toLocaleString() : "—"}
      />
      <StatCard
        label="Open Issues"
        value={openIssues !== undefined ? openIssues.toLocaleString() : "—"}
      />
    </div>
  );
}
