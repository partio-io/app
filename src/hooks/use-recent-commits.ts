import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { RepoLatestCheckpoint } from "@/types/repository";
import type { OverviewStats } from "@/types/checkpoint";

interface RecentCheckpointsResponse {
  items: RepoLatestCheckpoint[];
  heatmap: Record<string, number>;
  stats: OverviewStats;
}

export function useRecentCheckpoints() {
  const { data, error, isLoading } = useSWR<RecentCheckpointsResponse>(
    "/api/github/repos/recent-commits",
    fetcher
  );

  return {
    items: data?.items,
    heatmap: data?.heatmap,
    stats: data?.stats,
    isLoading,
    isError: !!error,
  };
}
