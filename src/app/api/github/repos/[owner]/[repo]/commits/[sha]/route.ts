import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getCommit } from "@/lib/github/commits";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; sha: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, sha } = await params;
  const octokit = createOctokit(session.accessToken);

  try {
    const commit = await getCommit(octokit, owner, repo, sha);
    return NextResponse.json(commit);
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json({ error: "Commit not found" }, { status });
  }
}
