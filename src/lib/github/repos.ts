import { Octokit } from "@octokit/rest";
import type { RepoWithCheckpoints } from "@/types/checkpoint";

const CHECKPOINT_BRANCH = "partio/checkpoints/v1";

export type MetadataEntry = { path: string; sha: string };

export type RepoWithCheckpointsInternal = RepoWithCheckpoints & {
  _metadata_entries: MetadataEntry[];
};

const REPOS_CACHE_TTL_MS = 60_000;
const reposCache = new Map<
  string,
  { data: RepoWithCheckpointsInternal[]; timestamp: number }
>();

export async function listReposWithCheckpoints(
  octokit: Octokit,
  cacheKey?: string
): Promise<RepoWithCheckpointsInternal[]> {
  if (cacheKey) {
    const cached = reposCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < REPOS_CACHE_TTL_MS) {
      return cached.data;
    }
  }
  const { data: repos } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
    visibility: "all",
  });

  const results = await Promise.allSettled(
    repos.map(async (repo) => {
      let checkpointCount = 0;
      let metadataEntries: MetadataEntry[] = [];
      try {
        const { data: ref } = await octokit.git.getRef({
          owner: repo.owner.login,
          repo: repo.name,
          ref: `heads/${CHECKPOINT_BRANCH}`,
        });

        const { data: commit } = await octokit.git.getCommit({
          owner: repo.owner.login,
          repo: repo.name,
          commit_sha: ref.object.sha,
        });

        const { data: tree } = await octokit.git.getTree({
          owner: repo.owner.login,
          repo: repo.name,
          tree_sha: commit.tree.sha,
          recursive: "1",
        });

        const filtered = (tree.tree || []).filter(
          (entry) =>
            entry.path &&
            entry.sha &&
            /^[0-9a-f]{2}\/[0-9a-f]{10}\/metadata\.json$/.test(entry.path)
        );
        checkpointCount = filtered.length;
        metadataEntries = filtered.map((e) => ({
          path: e.path!,
          sha: e.sha!,
        }));
      } catch {
        // No checkpoint branch — that's fine
      }

      return {
        owner: repo.owner.login,
        name: repo.name,
        full_name: repo.full_name,
        language: repo.language ?? null,
        stars: repo.stargazers_count ?? 0,
        checkpoint_count: checkpointCount,
        updated_at: repo.updated_at ?? new Date().toISOString(),
        description: repo.description ?? null,
        open_issues_count: repo.open_issues_count ?? 0,
        _metadata_entries: metadataEntries,
      } satisfies RepoWithCheckpointsInternal;
    })
  );

  const data = results
    .filter(
      (r): r is PromiseFulfilledResult<RepoWithCheckpointsInternal> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  if (cacheKey) {
    reposCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}
