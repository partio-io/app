import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { BranchSummary } from "@/lib/github/branches";

export function useBranches(owner: string, repo: string) {
  const { data, error, isLoading } = useSWR<BranchSummary[]>(
    `/api/github/repos/${owner}/${repo}/branches`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    branches: data,
    isLoading,
    isError: !!error,
  };
}
