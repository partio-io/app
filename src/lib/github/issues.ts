import { Octokit } from "@octokit/rest";
import type { IssueSummary, IssueDetail } from "@/types/repository";

export async function listIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  options?: { state?: "open" | "closed" | "all"; per_page?: number }
): Promise<IssueSummary[]> {
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: options?.state ?? "open",
    sort: "updated",
    direction: "desc",
    per_page: options?.per_page ?? 30,
  });

  // Filter out pull requests (GitHub includes PRs in the issues endpoint)
  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state as "open" | "closed",
      user: {
        login: issue.user?.login ?? "unknown",
        avatar_url: issue.user?.avatar_url ?? "",
        html_url: issue.user?.html_url ?? "",
      },
      labels: (issue.labels || [])
        .filter((l): l is { id: number; name: string; color: string; description: string | null } => typeof l !== "string")
        .map((l) => ({
          id: l.id ?? 0,
          name: l.name ?? "",
          color: l.color ?? "000000",
          description: l.description ?? null,
        })),
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      closed_at: issue.closed_at ?? null,
      comments: issue.comments,
    }));
}

export async function getIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  number: number
): Promise<IssueDetail> {
  const { data: issue } = await octokit.issues.get({
    owner,
    repo,
    issue_number: number,
  });

  return {
    number: issue.number,
    title: issue.title,
    state: issue.state as "open" | "closed",
    user: {
      login: issue.user?.login ?? "unknown",
      avatar_url: issue.user?.avatar_url ?? "",
      html_url: issue.user?.html_url ?? "",
    },
    labels: (issue.labels || [])
      .filter((l): l is { id: number; name: string; color: string; description: string | null } => typeof l !== "string")
      .map((l) => ({
        id: l.id ?? 0,
        name: l.name ?? "",
        color: l.color ?? "000000",
        description: l.description ?? null,
      })),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    closed_at: issue.closed_at ?? null,
    comments: issue.comments,
    body: issue.body ?? null,
    assignees: (issue.assignees || []).map((a) => ({
      login: a.login,
      avatar_url: a.avatar_url,
      html_url: a.html_url,
    })),
    milestone: issue.milestone ? { title: issue.milestone.title } : null,
  };
}
