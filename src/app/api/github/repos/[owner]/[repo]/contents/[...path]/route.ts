import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { getContents } from "@/lib/github/contents";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, path } = await params;
  const filePath = path.join("/");
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref") ?? undefined;

  const octokit = createOctokit(session.accessToken);

  try {
    const result = await getContents(octokit, owner, repo, filePath, ref);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json({ error: "Failed to fetch contents" }, { status });
  }
}
