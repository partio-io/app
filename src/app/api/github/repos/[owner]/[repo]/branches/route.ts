import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getRepoDetail } from "@/lib/github/repo-detail";
import { listBranches } from "@/lib/github/branches";

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
  const detail = await getRepoDetail(octokit, owner, repo);
  const branches = await listBranches(
    octokit,
    owner,
    repo,
    detail.default_branch
  );
  return NextResponse.json(branches);
}
