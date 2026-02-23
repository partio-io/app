import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { listReposWithCheckpoints } from "@/lib/github/repos";
import { getRecentCheckpointsForRepos } from "@/lib/github/recent-commits";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const octokit = createOctokit(session.accessToken);
  const repos = await listReposWithCheckpoints(octokit);
  const checkpointRepos = repos.filter((r) => r.checkpoint_count > 0);

  const result = await getRecentCheckpointsForRepos(octokit, checkpointRepos);
  return NextResponse.json(result);
}
