import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { CheckpointMetadata, Message } from "@/types/checkpoint";

export function useCheckpoints(owner: string, repo: string) {
  const { data, error, isLoading } = useSWR<CheckpointMetadata[]>(
    `/api/github/repos/${owner}/${repo}/checkpoints`,
    fetcher
  );

  return {
    checkpoints: data,
    isLoading,
    isError: !!error,
  };
}

export function useCheckpoint(owner: string, repo: string, id: string) {
  const { data, error, isLoading } = useSWR<CheckpointMetadata>(
    `/api/github/repos/${owner}/${repo}/checkpoints/${id}`,
    fetcher
  );

  return {
    checkpoint: data,
    isLoading,
    isError: !!error,
  };
}

export function useSession(owner: string, repo: string, id: string) {
  const { data, error, isLoading } = useSWR<Message[]>(
    `/api/github/repos/${owner}/${repo}/checkpoints/${id}/session`,
    fetcher
  );

  return {
    messages: data,
    isLoading,
    isError: !!error,
  };
}

export function useDiff(owner: string, repo: string, checkpointId: string) {
  const { data, error, isLoading } = useSWR<{ diff: string }>(
    checkpointId
      ? `/api/github/repos/${owner}/${repo}/checkpoints/${checkpointId}/diff`
      : null,
    fetcher
  );

  return {
    diff: data?.diff,
    isLoading,
    isError: !!error,
  };
}

export function usePlan(owner: string, repo: string, checkpointId: string) {
  const { data, error, isLoading } = useSWR<{ plan: string }>(
    checkpointId
      ? `/api/github/repos/${owner}/${repo}/checkpoints/${checkpointId}/plan`
      : null,
    fetcher
  );

  return {
    plan: data?.plan,
    isLoading,
    isError: !!error,
  };
}
