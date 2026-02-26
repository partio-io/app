import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { listPullRequests } from "@/lib/github/pulls";

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
  const state = (searchParams.get("state") as "open" | "closed" | "all") ?? "open";

  const octokit = createOctokit(session.accessToken);
  const pulls = await listPullRequests(octokit, owner, repo, { state });
  return NextResponse.json(pulls);
}
