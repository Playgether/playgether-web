"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTermsContext } from "@/context/TermsContext";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { TermsViewModal } from "./TermsViewModal";
import type { LegalDocumentData } from "@/context/TermsContext";

/**
 * Modal que exibe os documentos legais pendentes de aceite.
 * Cada documento tem seu checkbox e link para leitura.
 * O usuário precisa marcar todos e clicar em Aceitar.
 */
export function TermsAcceptanceModal() {
  const {
    pendingDocuments,
    isModalOpen,
    hideTermsModal,
    forceAccept,
    acceptTerms,
    isAccepting,
  } = useTermsContext();

  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [viewingDoc, setViewingDoc] = useState<LegalDocumentData | null>(null);

  useEffect(() => {
    setCheckedIds(new Set());
  }, [pendingDocuments]);

  const allChecked = useMemo(() => {
    if (pendingDocuments.length === 0) return false;
    return pendingDocuments.every((d) => checkedIds.has(d.id));
  }, [pendingDocuments, checkedIds]);

  const toggleCheck = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAccept = async () => {
    if (!allChecked || pendingDocuments.length === 0) return;
    const ok = await acceptTerms(pendingDocuments.map((d) => d.id));
    if (ok) {
      setCheckedIds(new Set());
      window.location.reload();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !forceAccept) {
      hideTermsModal();
    }
    if (!open) {
      setViewingDoc(null);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] flex flex-col"
          onPointerDownOutside={(e) => forceAccept && e.preventDefault()}
          onEscapeKeyDown={(e) => forceAccept && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Atualização dos Termos e Políticas</DialogTitle>
            <DialogDescription>
              Alguns termos ou políticas foram atualizados. Por favor, leia e
              aceite cada um para continuar usando a aplicação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {pendingDocuments.length === 0 ? (
              <div className="text-muted-foreground text-sm py-4 text-center">
                Carregando...
              </div>
            ) : (
              pendingDocuments.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checkedIds.has(doc.id)}
                    onChange={() => toggleCheck(doc.id)}
                    className="w-5 h-5 rounded border-2 border-foreground/30 bg-transparent accent-neon-blue"
                  />
                  <span className="flex-1 text-sm text-foreground">
                    {doc.document_type_display} - {doc.title}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setViewingDoc(doc);
                    }}
                    className="text-neon-blue hover:underline text-sm font-medium"
                  >
                    Ler
                  </button>
                </label>
              ))
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {!forceAccept && (
              <Button variant="outline" onClick={hideTermsModal}>
                Fechar
              </Button>
            )}
            <Button
              onClick={handleAccept}
              disabled={
                pendingDocuments.length === 0 || !allChecked || isAccepting
              }
              className="gradient-primary"
            >
              {isAccepting ? (
                <span className="flex items-center gap-2">
                  <LoadingComponent showText={false} className="h-4 w-4" />
                  Aceitando...
                </span>
              ) : (
                "Aceitar e continuar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TermsViewModal
        open={!!viewingDoc}
        onOpenChange={(open) => !open && setViewingDoc(null)}
        document={viewingDoc}
      />
    </>
  );
}
