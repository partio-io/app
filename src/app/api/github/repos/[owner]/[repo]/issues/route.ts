import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { listIssues } from "@/lib/github/issues";

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
  const issues = await listIssues(octokit, owner, repo, { state });
  return NextResponse.json(issues);
}
