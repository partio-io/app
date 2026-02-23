import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { TreeEntry, FileContent } from "@/types/repository";

type ContentsResult =
  | { type: "dir"; entries: TreeEntry[] }
  | { type: "file"; file: FileContent };

export function useContents(owner: string, repo: string, path: string = "") {
  const apiPath = path
    ? `/api/github/repos/${owner}/${repo}/contents/${path}`
    : `/api/github/repos/${owner}/${repo}/contents`;

  const { data, error, isLoading } = useSWR<ContentsResult>(
    apiPath,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    contents: data,
    isLoading,
    isError: !!error,
  };
}
