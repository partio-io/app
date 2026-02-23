import { Octokit } from "@octokit/rest";
import type { CommitSummary, CommitDetail } from "@/types/repository";

export async function listCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  options?: { per_page?: number; sha?: string }
): Promise<CommitSummary[]> {
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: options?.per_page ?? 30,
    sha: options?.sha,
  });

  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    author: c.author
      ? {
          login: c.author.login,
          avatar_url: c.author.avatar_url,
          html_url: c.author.html_url,
        }
      : null,
    date: c.commit.author?.date ?? c.commit.committer?.date ?? "",
    committer: c.committer
      ? {
          login: c.committer.login,
          avatar_url: c.committer.avatar_url,
          html_url: c.committer.html_url,
        }
      : null,
  }));
}

export async function getCommit(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string
): Promise<CommitDetail> {
  const { data: c } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  return {
    sha: c.sha,
    message: c.commit.message,
    author: c.author
      ? {
          login: c.author.login,
          avatar_url: c.author.avatar_url,
          html_url: c.author.html_url,
        }
      : null,
    date: c.commit.author?.date ?? c.commit.committer?.date ?? "",
    committer: c.committer
      ? {
          login: c.committer.login,
          avatar_url: c.committer.avatar_url,
          html_url: c.committer.html_url,
        }
      : null,
    files: (c.files || []).map((f) => ({
      filename: f.filename ?? "",
      status: f.status ?? "modified",
      additions: f.additions ?? 0,
      deletions: f.deletions ?? 0,
      changes: f.changes ?? 0,
      patch: f.patch,
    })),
    stats: {
      total: c.stats?.total ?? 0,
      additions: c.stats?.additions ?? 0,
      deletions: c.stats?.deletions ?? 0,
    },
    parents: (c.parents || []).map((p) => ({ sha: p.sha })),
  };
}
