"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Cut } from "@/types/Cut";
import { CutCard } from "./CutCard";
import { CreateCutDialog } from "./CreateCutDialog";
import { CutCommentsPanel } from "./CutCommentsPanel";
import { getCuts } from "@/actions/getCuts";
import { useIsLgDesktop } from "@/hooks/use-lg-desktop";

interface CutsViewerProps {
  initialCuts: Cut[];
  initialNext: string | null;
  isAuthenticated: boolean;
}

export function CutsViewer({ initialCuts, initialNext, isAuthenticated }: CutsViewerProps) {
  const [cuts, setCuts] = useState<Cut[]>(initialCuts);
  const [next, setNext] = useState<string | null>(initialNext);
  const [activeIndex, setActiveIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentsCut, setCommentsCut] = useState<Cut | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isLgDesktop = useIsLgDesktop();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [cuts.length]);

  const loadMore = useCallback(async () => {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    try {
      const cursor = new URL(next).searchParams.get("cursor") ?? undefined;
      const { data, next: newNext } = await getCuts(cursor);
      setCuts((prev) => [...prev, ...data]);
      setNext(newNext);
    } catch { /* ignore */ } finally {
      setLoadingMore(false);
    }
  }, [next, loadingMore]);

  useEffect(() => {
    if (activeIndex >= cuts.length - 2) loadMore();
  }, [activeIndex, cuts.length, loadMore]);

  const goTo = (idx: number) => {
    const el = cardRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const closeComments = useCallback(() => setCommentsCut(null), []);

  if (cuts.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black">
        <p className="text-white/60">Nenhum cut ainda.</p>
        {isAuthenticated && (
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Postar o primeiro cut
            </button>
            <CreateCutDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(c) => setCuts([c])} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full">
      {/* Coluna do player + navegação */}
      <div className="relative flex h-full min-w-0 flex-1">
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none bg-black"
        >
          {cuts.map((cut, idx) => (
            <div key={cut.id} ref={(el) => { cardRefs.current[idx] = el; }} className="h-full w-full snap-start">
              <CutCard
                cut={cut}
                isActive={idx === activeIndex}
                isAuthenticated={isAuthenticated}
                onOpenComments={setCommentsCut}
                commentsActive={commentsCut?.id === cut.id}
              />
            </div>
          ))}

          {loadingMore && (
            <div className="flex h-16 items-center justify-center bg-black">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>

        {/* Toolbar flutuante — desktop: setas de navegação + criar, agrupados */}
        <div className="pointer-events-none absolute inset-y-0 right-4 z-40 hidden items-center lg:flex">
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-full bg-black/20 p-2 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Cut anterior"
              onClick={() => goTo(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Próximo cut"
              onClick={() => goTo(Math.min(cuts.length - 1, activeIndex + 1))}
              disabled={activeIndex >= cuts.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
            {isAuthenticated && (
              <>
                <div className="h-px w-6 bg-white/15" />
                <button
                  type="button"
                  aria-label="Criar Cut"
                  onClick={() => setCreateOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* FAB criar cut — mobile/tablet: canto superior esquerdo, longe dos controles do vídeo */}
        {isAuthenticated && (
          <button
            type="button"
            aria-label="Criar Cut"
            onClick={() => setCreateOpen(true)}
            className="absolute left-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 lg:hidden"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}

        <CreateCutDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(cut) => setCuts((prev) => [cut, ...prev])}
        />
      </div>

      {/* Painel lateral de comentários — desktop, ocupa espaço ao lado do vídeo */}
      {isLgDesktop && commentsCut && (
        <div className="hidden h-full w-[380px] shrink-0 lg:block">
          <CutCommentsPanel
            cut={commentsCut}
            isAuthenticated={isAuthenticated}
            onClose={closeComments}
            variant="side"
          />
        </div>
      )}

      {/* Bottom sheet de comentários — mobile/tablet */}
      {!isLgDesktop && commentsCut && (
        <CutCommentsPanel
          cut={commentsCut}
          isAuthenticated={isAuthenticated}
          onClose={closeComments}
          variant="sheet"
        />
      )}
    </div>
  );
}
