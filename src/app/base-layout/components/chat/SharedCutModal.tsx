"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { useAuthContext } from "@/context/AuthContext";
import { getCutById } from "@/actions/getCuts";
import { CutCard } from "@/app/cuts/components/CutCard";
import { CutCommentsPanel } from "@/app/cuts/components/CutCommentsPanel";
import type { Cut } from "@/types/Cut";

interface SharedCutModalProps {
  cutId: number | null;
  onOpenChange: (open: boolean) => void;
}

export function SharedCutModal({ cutId, onOpenChange }: SharedCutModalProps) {
  const { user } = useAuthContext();
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
      <DialogContent hideCloseButton className="h-[85dvh] w-full max-w-sm overflow-hidden border-white/10 bg-black p-0 sm:h-[85vh]">
        <DialogClose className="absolute left-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        {loading || !cut ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : (
          <CutCard
            cut={cut}
            isActive={cutId !== null}
            isAuthenticated={!!user}
            onOpenComments={() => setCommentsOpen(true)}
            commentsActive={commentsOpen}
          />
        )}

        {cut && commentsOpen && (
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
