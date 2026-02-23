import { Octokit } from "@octokit/rest";
import type { TreeEntry, FileContent } from "@/types/repository";

export async function getContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string = "",
  ref?: string
): Promise<{ type: "dir"; entries: TreeEntry[] } | { type: "file"; file: FileContent }> {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  // Directory listing
  if (Array.isArray(data)) {
    const entries: TreeEntry[] = data
      .map((item) => ({
        name: item.name,
        path: item.path,
        type: (item.type === "dir" ? "dir" : "file") as "file" | "dir",
        size: item.size ?? undefined,
        sha: item.sha,
      }))
      .sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return { type: "dir", entries };
  }

  // Single file
  if (data.type === "file" && "content" in data) {
    return {
      type: "file",
      file: {
        name: data.name,
        path: data.path,
        content: Buffer.from(data.content, "base64").toString("utf-8"),
        size: data.size,
        sha: data.sha,
        encoding: data.encoding,
      },
    };
  }

  // Submodule or symlink — return as empty file
  return {
    type: "file",
    file: {
      name: data.name,
      path: data.path,
      content: "",
      size: data.size,
      sha: data.sha,
      encoding: "none",
    },
  };
}
