import { Skeleton } from "@/components/ui/skeleton";

export default function CheckpointsLoading() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
    </div>
  );
}
