import { Skeleton } from "@/components/ui/skeleton";

export default function CheckpointDetailLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-8 w-96" />
      <Skeleton className="h-96" />
    </div>
  );
}
