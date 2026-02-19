import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { listCheckpoints } from "@/lib/github/checkpoints";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  const octokit = createOctokit(session.accessToken);
  const checkpoints = await listCheckpoints(octokit, owner, repo);
  return NextResponse.json(checkpoints);
}
