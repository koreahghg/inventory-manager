import { Skeleton, TableSkeleton } from "@/shared/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <TableSkeleton />
    </div>
  );
}
