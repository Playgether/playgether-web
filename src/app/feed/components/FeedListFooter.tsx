"use client";

import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { useFeedContext } from "../context/FeedContext";

export function FeedListFooter() {
  const { isFetchingNextPage, hasNextPage, posts } = useFeedContext();

  const showEndMessage =
    !isFetchingNextPage && !hasNextPage && posts.length > 0;

  return (
    <div className="pb-[calc(var(--layout-quick-messages-height)+var(--layout-bottom-nav-height)+2rem+env(safe-area-inset-bottom,0px))] pt-4 lg:pb-[calc(var(--layout-quick-messages-height)+2.5rem)]">
      {isFetchingNextPage ? (
        <div className="py-4">
          <LoadingComponent text="Carregando novos posts" showText />
        </div>
      ) : showEndMessage ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Você chegou ao fim — não há mais posts por aqui.
        </p>
      ) : (
        <div className="h-6" aria-hidden />
      )}
    </div>
  );
}
