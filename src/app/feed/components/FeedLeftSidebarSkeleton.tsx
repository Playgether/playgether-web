"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeedLeftSidebarSkeleton() {
  return (
    <div className="col-span-3 space-y-6 sticky-container">
      <Card className="bg-card border-border/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-3/4 mx-auto max-w-[200px]" />
          <Skeleton className="h-4 w-1/2 mx-auto max-w-[120px]" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex justify-between gap-2 pt-4 border-t border-border/50">
            <Skeleton className="h-12 flex-1 rounded-md" />
            <Skeleton className="h-12 flex-1 rounded-md" />
            <Skeleton className="h-12 flex-1 rounded-md" />
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-24">
        <Card className="bg-card border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-4 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 pb-3 mb-1 border-b border-border/50">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
