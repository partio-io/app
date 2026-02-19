import { Octokit } from "@octokit/rest";

export async function getCommitDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  commitHash: string
): Promise<string> {
  try {
    const { data } = await octokit.repos.getCommit({
      owner,
      repo,
      ref: commitHash,
      mediaType: {
        format: "diff",
      },
    });

    // When format is "diff", data is the raw diff string
    return data as unknown as string;
  } catch {
    return "";
  }
}
