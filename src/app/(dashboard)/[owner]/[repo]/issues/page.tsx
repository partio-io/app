"use client";

import { use } from "react";
import { IssueList } from "@/components/repo/issue-list";

export default function IssuesPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);

  return <IssueList owner={owner} repo={repo} />;
}
