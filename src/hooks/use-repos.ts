import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { RepoWithCheckpoints } from "@/types/checkpoint";

export function useRepos() {
  const { data, error, isLoading } = useSWR<RepoWithCheckpoints[]>(
    "/api/github/repos",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  return {
    repos: data,
    isLoading,
    isError: !!error,
  };
}
