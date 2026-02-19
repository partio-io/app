import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getCheckpoint } from "@/lib/github/checkpoints";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; id: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, id } = await params;
  const octokit = createOctokit(session.accessToken);
  const checkpoint = await getCheckpoint(octokit, owner, repo, id);

  if (!checkpoint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(checkpoint);
}
