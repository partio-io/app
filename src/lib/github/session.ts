import { Octokit } from "@octokit/rest";
import type { Message } from "@/types/checkpoint";

const CHECKPOINT_BRANCH = "partio/checkpoints/v1";

export async function getSessionData(
  octokit: Octokit,
  owner: string,
  repo: string,
  checkpointId: string
): Promise<Message[]> {
  const shard = checkpointId.slice(0, 2);
  const rest = checkpointId.slice(2);

  try {
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${CHECKPOINT_BRANCH}`,
    });

    const { data: commit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: ref.object.sha,
    });

    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: commit.tree.sha,
      recursive: "1",
    });

    const sessionPath = `${shard}/${rest}/full.jsonl`;
    const entry = (tree.tree || []).find((e) => e.path === sessionPath);

    if (!entry?.sha) return [];

    const { data: blob } = await octokit.git.getBlob({
      owner,
      repo,
      file_sha: entry.sha,
    });

    const content = Buffer.from(blob.content, "base64").toString("utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    return lines.map((line) => {
      const parsed = JSON.parse(line);
      return {
        role: parsed.role || "unknown",
        content: extractText(parsed.content),
        timestamp: parsed.timestamp || "",
        tokens: parsed.tokens,
      } satisfies Message;
    });
  } catch {
    return [];
  }
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (block?.type === "text") return block.text || "";
        if (block?.type === "tool_use")
          return `[Tool: ${block.name || "unknown"}]`;
        if (block?.type === "tool_result")
          return `[Tool Result: ${typeof block.content === "string" ? block.content.slice(0, 200) : "..."}]`;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(content ?? "");
}
