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

    const sessionPath = `${shard}/${rest}/0/full.jsonl`;
    const entry = (tree.tree || []).find((e) => e.path === sessionPath);

    if (!entry?.sha) return [];

    const { data: blob } = await octokit.git.getBlob({
      owner,
      repo,
      file_sha: entry.sha,
    });

    const content = Buffer.from(blob.content, "base64").toString("utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    const MESSAGE_TYPES = new Set(["user", "human", "assistant"]);

    return lines
      .map((line) => JSON.parse(line))
      .filter((parsed: any) => MESSAGE_TYPES.has(parsed.type || parsed.role))
      .map((parsed: any) => {
        return {
          role: parsed.type || parsed.role || "unknown",
          content: stripSystemTags(extractText(parsed)),
          timestamp: parsed.timestamp || "",
          tokens: parsed.tokens,
        } satisfies Message;
      })
      .filter((msg) => msg.content.trim() !== "");
  } catch {
    return [];
  }
}

function extractContentBlocks(blocks: any[]): string {
  return blocks
    .map((block: any) => {
      if (typeof block === "string") return block;
      if (block?.type === "text") return block.text || "";
      if (block?.type === "tool_use")
        return `[Tool: ${block.name || "unknown"}]`;
      if (block?.type === "tool_result")
        return `[Tool Result: ${typeof block.content === "string" ? block.content.slice(0, 200) : "..."}]`;
      // Skip thinking, redacted_thinking, and unknown block types
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

const SYSTEM_TAG_RE =
  /<(local-command-caveat|command-name|command-message|command-args|local-command-stdout|system-reminder|user-prompt-submit-hook)>[\s\S]*?<\/\1>/g;

function stripSystemTags(text: string): string {
  return text.replace(SYSTEM_TAG_RE, "");
}

function extractText(entry: Record<string, unknown>): string {
  // 1. Try contentBlocks (top-level array of {type, text})
  if (Array.isArray(entry.contentBlocks)) {
    return extractContentBlocks(entry.contentBlocks);
  }

  // 2. Try message field
  if (entry.message != null) {
    if (typeof entry.message === "string") return entry.message;
    const msg = entry.message as any;
    if (typeof msg.content === "string") return msg.content;
    if (Array.isArray(msg.content)) {
      return extractContentBlocks(msg.content);
    }
  }

  // 3. Try content field
  if (entry.content != null) {
    if (typeof entry.content === "string") return entry.content;
    if (Array.isArray(entry.content)) {
      return extractContentBlocks(entry.content as any[]);
    }
  }

  return "";
}
