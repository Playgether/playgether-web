"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthContext } from "@/context/AuthContext";
import { useIsLgDesktop } from "@/hooks/use-lg-desktop";
import { getCutById } from "@/actions/getCuts";
import { CutCard } from "@/app/cuts/components/CutCard";
import { CutCommentsPanel } from "@/app/cuts/components/CutCommentsPanel";
import type { Cut } from "@/types/Cut";

interface SharedCutModalProps {
  cutId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function SharedCutModal({ cutId, onOpenChange }: SharedCutModalProps) {
  const { user } = useAuthContext();
  const isLgDesktop = useIsLgDesktop();
  const [cut, setCut] = useState<Cut | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    if (!cutId) {
      setCut(null);
      return;
    }
    setLoading(true);
    setCommentsOpen(false);
    getCutById(cutId)
      .then(setCut)
      .finally(() => setLoading(false));
  }, [cutId]);

  return (
    <Dialog open={cutId !== null} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-black p-0 sm:w-screen sm:p-0 lg:left-[50%] lg:top-[50%] lg:h-[88vh] lg:w-[min(92vw,72rem)] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:border lg:border-white/10"
      >
        <VisuallyHidden>
          <DialogTitle>Cut {cut ? `de @${cut.username}` : ""}</DialogTitle>
        </VisuallyHidden>

        <DialogClose className="absolute left-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        {loading || !cut ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : (
          <div className="flex h-full w-full">
            <div className="relative h-full min-w-0 flex-1">
              <CutCard
                cut={cut}
                isActive={cutId !== null}
                isAuthenticated={!!user}
                onOpenComments={() => setCommentsOpen(true)}
                commentsActive={commentsOpen}
              />
            </div>

            {isLgDesktop && commentsOpen && (
              <div className="hidden h-full w-[380px] shrink-0 lg:block">
                <CutCommentsPanel
                  cut={cut}
                  isAuthenticated={!!user}
                  onClose={() => setCommentsOpen(false)}
                  variant="side"
                />
              </div>
            )}
          </div>
        )}

        {cut && !isLgDesktop && commentsOpen && (
          <CutCommentsPanel
            cut={cut}
            isAuthenticated={!!user}
            onClose={() => setCommentsOpen(false)}
            variant="sheet"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
