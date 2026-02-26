import { Octokit } from "@octokit/rest";

export interface BranchSummary {
  name: string;
  isDefault: boolean;
}

export async function listBranches(
  octokit: Octokit,
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<BranchSummary[]> {
  const { data } = await octokit.repos.listBranches({
    owner,
    repo,
    per_page: 100,
  });

  return data.map((b) => ({
    name: b.name,
    isDefault: b.name === defaultBranch,
  }));
}
