"use client";

import { use } from "react";
import { useIssue } from "@/hooks/use-issues";
import { IssueDetail } from "@/components/repo/issue-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function IssuePage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; number: string }>;
}) {
  const { owner, repo, number } = use(params);
  const { issue, isLoading } = useIssue(owner, repo, parseInt(number, 10));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!issue) {
    return <EmptyState title="Issue not found" description={`Issue #${number} could not be found.`} />;
  }

  return <IssueDetail issue={issue} />;
}
