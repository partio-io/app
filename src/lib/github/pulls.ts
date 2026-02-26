import { Octokit } from "@octokit/rest";
import type { PullRequestSummary, PullRequestDetail } from "@/types/repository";

export async function listPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  options?: { state?: "open" | "closed" | "all"; per_page?: number }
): Promise<PullRequestSummary[]> {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: options?.state ?? "open",
    sort: "updated",
    direction: "desc",
    per_page: options?.per_page ?? 30,
  });

  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state as "open" | "closed",
    merged: pr.merged_at !== null,
    draft: pr.draft ?? false,
    user: {
      login: pr.user?.login ?? "unknown",
      avatar_url: pr.user?.avatar_url ?? "",
      html_url: pr.user?.html_url ?? "",
    },
    labels: (pr.labels || []).map((l) => ({
      id: l.id ?? 0,
      name: l.name ?? "",
      color: l.color ?? "000000",
      description: l.description ?? null,
    })),
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    merged_at: pr.merged_at,
    comments: (pr as unknown as { comments?: number }).comments ?? 0,
    head: { ref: pr.head.ref },
    base: { ref: pr.base.ref },
  }));
}

export async function getPullRequest(
  octokit: Octokit,
  owner: string,
  repo: string,
  number: number
): Promise<PullRequestDetail> {
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: number,
  });

  return {
    number: pr.number,
    title: pr.title,
    state: pr.state as "open" | "closed",
    merged: pr.merged,
    draft: pr.draft ?? false,
    user: {
      login: pr.user?.login ?? "unknown",
      avatar_url: pr.user?.avatar_url ?? "",
      html_url: pr.user?.html_url ?? "",
    },
    labels: (pr.labels || []).map((l) => ({
      id: l.id ?? 0,
      name: l.name ?? "",
      color: l.color ?? "000000",
      description: l.description ?? null,
    })),
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    merged_at: pr.merged_at,
    comments: pr.comments ?? 0,
    head: { ref: pr.head.ref },
    base: { ref: pr.base.ref },
    body: pr.body,
    additions: pr.additions,
    deletions: pr.deletions,
    changed_files: pr.changed_files,
    mergeable: pr.mergeable,
    commits: pr.commits,
    review_comments: pr.review_comments,
  };
}
