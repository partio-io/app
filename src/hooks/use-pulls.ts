import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { PullRequestSummary, PullRequestDetail } from "@/types/repository";

export function usePulls(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
) {
  const { data, error, isLoading } = useSWR<PullRequestSummary[]>(
    `/api/github/repos/${owner}/${repo}/pulls?state=${state}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    pulls: data,
    isLoading,
    isError: !!error,
  };
}

export function usePullRequest(owner: string, repo: string, number: number) {
  const { data, error, isLoading } = useSWR<PullRequestDetail>(
    `/api/github/repos/${owner}/${repo}/pulls/${number}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    pr: data,
    isLoading,
    isError: !!error,
  };
}
