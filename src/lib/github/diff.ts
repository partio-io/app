import { Octokit } from "@octokit/rest";

const CHECKPOINT_BRANCH = "partio/checkpoints/v1";

export async function getCheckpointDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  checkpointId: string
): Promise<string> {
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

    const diffPath = `${shard}/${rest}/0/diff.patch`;
    const entry = (tree.tree || []).find((e) => e.path === diffPath);

    if (!entry?.sha) return "";

    const { data: blob } = await octokit.git.getBlob({
      owner,
      repo,
      file_sha: entry.sha,
    });

    return Buffer.from(blob.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}
