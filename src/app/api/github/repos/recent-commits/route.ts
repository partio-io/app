import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { listReposWithCheckpoints } from "@/lib/github/repos";
import {
  getRecentCheckpointsForRepos,
  type RecentCheckpointsResult,
} from "@/lib/github/recent-commits";

const CACHE_TTL_MS = 60_000;
const responseCache = new Map<
  string,
  { data: RecentCheckpointsResult; timestamp: number }
>();

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = session.user?.login ?? "unknown";
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  const octokit = createOctokit(session.accessToken);
  const repos = await listReposWithCheckpoints(octokit, cacheKey);
  const checkpointRepos = repos.filter((r) => r.checkpoint_count > 0);

  const result = await getRecentCheckpointsForRepos(octokit, checkpointRepos);

  responseCache.set(cacheKey, { data: result, timestamp: Date.now() });

  return NextResponse.json(result);
}
