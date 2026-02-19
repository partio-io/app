import useSWR from "swr";
import type { RepoWithCheckpoints } from "@/types/checkpoint";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

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
