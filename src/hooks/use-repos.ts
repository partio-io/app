import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { RepoWithCheckpoints } from "@/types/checkpoint";

export function useRepos() {
  const { data, error, isLoading } = useSWR<RepoWithCheckpoints[]>(
    "/api/github/repos",
    fetcher
  );

  return {
    repos: data,
    isLoading,
    isError: !!error,
  };
}
