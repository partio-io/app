import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getRepoDetail } from "@/lib/github/repo-detail";

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

  try {
    const detail = await getRepoDetail(octokit, owner, repo);
    return NextResponse.json(detail);
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json({ error: "Failed to fetch repo" }, { status });
  }
}
