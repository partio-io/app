import { Octokit } from "@octokit/rest";
import type { CheckpointMetadata } from "@/types/checkpoint";

const CHECKPOINT_BRANCH = "partio/checkpoints/v1";

export async function listCheckpoints(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<CheckpointMetadata[]> {
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

  const metadataEntries = (tree.tree || []).filter(
    (entry) =>
      entry.path &&
      /^[0-9a-f]{2}\/[0-9a-f]{10}\/metadata\.json$/.test(entry.path)
  );

  const checkpoints = await Promise.allSettled(
    metadataEntries.map(async (entry) => {
      const { data: blob } = await octokit.git.getBlob({
        owner,
        repo,
        file_sha: entry.sha!,
      });

      const content = Buffer.from(blob.content, "base64").toString("utf-8");
      return JSON.parse(content) as CheckpointMetadata;
    })
  );

  return checkpoints
    .filter(
      (r): r is PromiseFulfilledResult<CheckpointMetadata> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function getCheckpoint(
  octokit: Octokit,
  owner: string,
  repo: string,
  checkpointId: string
): Promise<CheckpointMetadata | null> {
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

    const metadataPath = `${shard}/${rest}/metadata.json`;
    const entry = (tree.tree || []).find((e) => e.path === metadataPath);

    if (!entry?.sha) return null;

    const { data: blob } = await octokit.git.getBlob({
      owner,
      repo,
      file_sha: entry.sha,
    });

    const content = Buffer.from(blob.content, "base64").toString("utf-8");
    return JSON.parse(content) as CheckpointMetadata;
  } catch {
    return null;
  }
}
