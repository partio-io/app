import { Octokit } from "@octokit/rest";
import type { RepoDetail } from "@/types/repository";

export async function getRepoDetail(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<RepoDetail> {
  const { data } = await octokit.repos.get({ owner, repo });

  return {
    owner: data.owner.login,
    name: data.name,
    description: data.description,
    private: data.private,
    language: data.language,
    license: data.license?.spdx_id ?? null,
    default_branch: data.default_branch,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    watchers_count: data.subscribers_count,
    open_issues_count: data.open_issues_count,
    topics: data.topics ?? [],
    homepage: data.homepage || null,
    size: data.size,
    avatar_url: data.owner.avatar_url,
    html_url: data.html_url,
    pushed_at: data.pushed_at ?? new Date().toISOString(),
  };
}
