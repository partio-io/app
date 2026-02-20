import useSWR from "swr";
import type { CheckpointMetadata, Message } from "@/types/checkpoint";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

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
