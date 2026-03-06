import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { listReposWithCheckpoints } from "@/lib/github/repos";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const octokit = createOctokit(session.accessToken);
  const repos = await listReposWithCheckpoints(octokit, session.user?.login ?? "unknown");
  const publicRepos = repos.map(
    ({ _metadata_entries, ...rest }) => rest
  );
  return NextResponse.json(publicRepos);
}
