import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Skeleton } from "@/components/ui/skeleton";

const TAB_COUNT = 8;

export default function RoomChatSkeleton() {
  return (
    <BaseLayout>
      <div className="flex h-layout-main min-h-0 min-w-0 flex-col bg-background pl-0 md:pl-20">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[88rem] flex-1 flex-col px-0 py-0 md:p-6">
          <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-none border-y border-border/50 bg-background md:rounded-2xl md:border">
            <nav className="shrink-0 border-b border-border bg-card/80 px-2 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-36 max-w-[40%]" />
                <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
                  {Array.from({ length: TAB_COUNT }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 rounded-md" />
                  ))}
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </nav>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 md:p-4">
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
                  >
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <div className={`space-y-1 ${i % 3 === 0 ? "items-end" : ""}`}>
                      <Skeleton
                        className={`h-3 w-20 ${i % 3 === 0 ? "ml-auto" : ""}`}
                      />
                      <Skeleton
                        className={`h-10 rounded-2xl ${
                          i % 2 === 0 ? "w-48 sm:w-64" : "w-36 sm:w-52"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 shrink-0 border-t border-border/40 pt-3">
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </BaseLayout>
  );
}
