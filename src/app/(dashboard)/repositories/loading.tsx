import { Skeleton } from "@/components/ui/skeleton";

export default function RepositoriesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-64" />
    </div>
  );
}
