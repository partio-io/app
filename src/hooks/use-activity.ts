import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { WeeklyActivity } from "@/types/repository";

export function useActivity(owner: string, repo: string) {
  const { data, error, isLoading } = useSWR<WeeklyActivity[]>(
    `/api/github/repos/${owner}/${repo}/activity`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    activity: data,
    isLoading,
    isError: !!error,
  };
}
