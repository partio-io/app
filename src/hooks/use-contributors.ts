import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Contributor } from "@/types/repository";

export function useContributors(owner: string, repo: string) {
  const { data, error, isLoading } = useSWR<Contributor[]>(
    `/api/github/repos/${owner}/${repo}/contributors`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    contributors: data,
    isLoading,
    isError: !!error,
  };
}
