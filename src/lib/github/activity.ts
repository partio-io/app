import { Octokit } from "@octokit/rest";
import type { WeeklyActivity } from "@/types/repository";

export async function getCommitActivity(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<WeeklyActivity[]> {
  try {
    const response = await octokit.repos.getCommitActivityStats({
      owner,
      repo,
    });

    // GitHub returns 202 when stats are being computed
    if (response.status === 202 || !Array.isArray(response.data)) {
      return [];
    }

    return (response.data || []).map((week) => ({
      week: week.week,
      total: week.total,
      days: week.days,
    }));
  } catch {
    return [];
  }
}
