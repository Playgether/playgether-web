import RoomCardSkeleton from "@/components/pages/rooms/RoomCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsLoading() {
  return (
    <section className="min-h-layout-main w-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Skeleton className="mb-2 h-4 w-16" />
            <Skeleton className="mb-2 h-10 w-48" />
            <Skeleton className="h-5 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-32 shrink-0 rounded-md" />
        </header>

        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-52 shrink-0 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <RoomCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
