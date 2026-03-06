import { Octokit } from "@octokit/rest";
import { listCheckpointsFromEntries } from "@/lib/github/checkpoints";
import { listCommits } from "@/lib/github/commits";
import type { CheckpointMetadata, OverviewStats } from "@/types/checkpoint";
import type { RepoLatestCheckpoint } from "@/types/repository";
import type { MetadataEntry } from "@/lib/github/repos";

const RECENT_LIMIT = 10;

export interface RecentCheckpointsResult {
  items: RepoLatestCheckpoint[];
  heatmap: Record<string, number>;
  stats: OverviewStats;
}

export async function getRecentCheckpointsForRepos(
  octokit: Octokit,
  repos: { owner: string; name: string; _metadata_entries: MetadataEntry[] }[]
): Promise<RecentCheckpointsResult> {
  const heatmap: Record<string, number> = {};

  // Pass 1: fetch all checkpoints from every repo, collect heatmap data
  const allCheckpoints: {
    owner: string;
    repo: string;
    checkpoint: CheckpointMetadata;
  }[] = [];

  await Promise.allSettled(
    repos.map(async (repo) => {
      const checkpoints = await listCheckpointsFromEntries(
        octokit,
        repo.owner,
        repo.name,
        repo._metadata_entries
      );

      for (const cp of checkpoints) {
        const date = cp.created_at.split("T")[0];
        heatmap[date] = (heatmap[date] || 0) + 1;
        allCheckpoints.push({ owner: repo.owner, repo: repo.name, checkpoint: cp });
      }
    })
  );

  // Sort newest-first and take the top N
  allCheckpoints.sort(
    (a, b) =>
      new Date(b.checkpoint.created_at).getTime() -
      new Date(a.checkpoint.created_at).getTime()
  );
  const top = allCheckpoints.slice(0, RECENT_LIMIT);

  // Pass 2: enrich only the top checkpoints with commit + session data
  const items = await Promise.all(
    top.map(async ({ owner, repo, checkpoint }) => {
      let commit = null;
      try {
        const commits = await listCommits(octokit, owner, repo, {
          sha: checkpoint.commit_hash,
          per_page: 1,
        });
        if (commits.length > 0) commit = commits[0];
      } catch {
        // Commit may no longer exist — that's fine
      }

      return {
        owner,
        repo,
        checkpoint: {
          id: checkpoint.id,
          commit_hash: checkpoint.commit_hash,
          branch: checkpoint.branch,
          created_at: checkpoint.created_at,
          agent: checkpoint.agent,
          agent_percent: checkpoint.agent_percent,
        },
        commit,
        summary: null,
        session_duration_ms: null,
      } satisfies RepoLatestCheckpoint;
    })
  );

  // Compute overview stats from the full checkpoint list
  const now = new Date();
  const msPerDay = 86_400_000;
  const weekAgo = now.getTime() - 7 * msPerDay;
  const twoWeeksAgo = now.getTime() - 14 * msPerDay;

  const uniqueRepos = new Set(
    allCheckpoints.map((c) => `${c.owner}/${c.repo}`)
  );

  let thisWeek = 0;
  let prevWeek = 0;
  let agentPercentSum = 0;

  for (const { checkpoint } of allCheckpoints) {
    const t = new Date(checkpoint.created_at).getTime();
    if (t >= weekAgo) thisWeek++;
    else if (t >= twoWeeksAgo) prevWeek++;
    agentPercentSum += checkpoint.agent_percent ?? 0;
  }

  const avgAgentPercent =
    allCheckpoints.length > 0
      ? Math.round(agentPercentSum / allCheckpoints.length)
      : 0;

  // Streak: walk backwards from today through consecutive days with activity
  let streakDays = 0;
  const todayStr = now.toISOString().split("T")[0];
  const d = new Date(todayStr); // start of today (local)
  // If today has no activity, check if yesterday does (allow "today hasn't happened yet")
  if (!heatmap[todayStr]) {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (heatmap[key] && heatmap[key] > 0) {
      streakDays++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  const stats: OverviewStats = {
    total_checkpoints: allCheckpoints.length,
    active_repos: uniqueRepos.size,
    this_week: thisWeek,
    prev_week: prevWeek,
    avg_agent_percent: avgAgentPercent,
    streak_days: streakDays,
  };

  return { items, heatmap, stats };
}
