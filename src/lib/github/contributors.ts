import { Octokit } from "@octokit/rest";
import type { Contributor } from "@/types/repository";

export async function listContributors(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Contributor[]> {
  try {
    const { data } = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 30,
    });

    return (data || []).map((c) => ({
      login: c.login ?? "unknown",
      avatar_url: c.avatar_url ?? "",
      html_url: c.html_url ?? "",
      contributions: c.contributions ?? 0,
    }));
  } catch {
    return [];
  }
}
