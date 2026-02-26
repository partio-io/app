import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { listCommits } from "@/lib/github/commits";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const sha = searchParams.get("sha") ?? undefined;

  const octokit = createOctokit(session.accessToken);
  const commits = await listCommits(octokit, owner, repo, { sha });
  return NextResponse.json(commits);
}
