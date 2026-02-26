import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getPullRequest } from "@/lib/github/pulls";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, number } = await params;
  const octokit = createOctokit(session.accessToken);

  try {
    const pr = await getPullRequest(octokit, owner, repo, parseInt(number, 10));
    return NextResponse.json(pr);
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json({ error: "PR not found" }, { status });
  }
}
