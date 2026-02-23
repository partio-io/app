import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getCheckpointPlan } from "@/lib/github/plan";

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
  const plan = await getCheckpointPlan(octokit, owner, repo, id);
  return NextResponse.json({ plan });
}
