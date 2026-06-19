import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-improved">
      <Skeleton className="h-52 w-full rounded-none sm:h-56" />
      <div className="flex min-h-[176px] flex-col p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-5/6" />
        <div className="mt-auto flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-20 rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="hidden h-4 w-10 sm:block" />
          </div>
        </div>
      </div>
    </Card>
  );
}
