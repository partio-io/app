import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { CommitSummary, CommitDetail } from "@/types/repository";

export function useCommits(owner: string, repo: string, sha?: string) {
  const params = sha ? `?sha=${encodeURIComponent(sha)}` : "";
  const { data, error, isLoading } = useSWR<CommitSummary[]>(
    `/api/github/repos/${owner}/${repo}/commits${params}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    commits: data,
    isLoading,
    isError: !!error,
  };
}

export function useCommit(owner: string, repo: string, sha: string) {
  const { data, error, isLoading } = useSWR<CommitDetail>(
    sha ? `/api/github/repos/${owner}/${repo}/commits/${sha}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    commit: data,
    isLoading,
    isError: !!error,
  };
}
