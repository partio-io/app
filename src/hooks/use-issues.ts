import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { IssueSummary, IssueDetail } from "@/types/repository";

export function useIssues(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open"
) {
  const { data, error, isLoading } = useSWR<IssueSummary[]>(
    `/api/github/repos/${owner}/${repo}/issues?state=${state}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    issues: data,
    isLoading,
    isError: !!error,
  };
}

export function useIssue(owner: string, repo: string, number: number) {
  const { data, error, isLoading } = useSWR<IssueDetail>(
    `/api/github/repos/${owner}/${repo}/issues/${number}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    issue: data,
    isLoading,
    isError: !!error,
  };
}
