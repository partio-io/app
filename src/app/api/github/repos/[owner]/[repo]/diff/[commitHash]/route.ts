import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getCommitDiff } from "@/lib/github/diff";

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ owner: string; repo: string; commitHash: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, commitHash } = await params;
  const octokit = createOctokit(session.accessToken);
  const diff = await getCommitDiff(octokit, owner, repo, commitHash);
  return NextResponse.json({ diff });
}
