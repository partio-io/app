import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { RepoDetail } from "@/types/repository";

export function useRepoDetail(owner: string, repo: string) {
  const { data, error, isLoading } = useSWR<RepoDetail>(
    `/api/github/repos/${owner}/${repo}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    repo: data,
    isLoading,
    isError: !!error,
  };
}
