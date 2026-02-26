"use client";

import { use, useCallback } from "react";
import { useCheckpoints } from "@/hooks/use-checkpoints";
import { PRList } from "@/components/repo/pr-list";

export default function PullsPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const { checkpoints } = useCheckpoints(owner, repo);

  const findCheckpoint = useCallback(
    (branch: string) =>
      checkpoints?.find((cp) => cp.branch === branch)?.id,
    [checkpoints]
  );

  return <PRList owner={owner} repo={repo} findCheckpoint={findCheckpoint} />;
}
