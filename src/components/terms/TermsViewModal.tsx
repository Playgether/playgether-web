"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTermsContext } from "@/context/TermsContext";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { useEffect, useState } from "react";
import type { LegalDocumentData } from "@/context/TermsContext";

type TermsViewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando informado, carrega e exibe apenas esse documento. Caso contrário, usa o documento passado em document. */
  documentType?: string;
  /** Documento já carregado (ex: da lista de documentos) */
  document?: LegalDocumentData | null;
};

/**
 * Modal para visualização de um documento legal.
 * Usado no cadastro (link "ler") e em outros lugares.
 */
export function TermsViewModal({
  open,
  onOpenChange,
  documentType,
  document: documentProp,
}: TermsViewModalProps) {
  const { loadDocumentByType } = useTermsContext();
  const [doc, setDoc] = useState<LegalDocumentData | null>(documentProp ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (documentProp) {
        setDoc(documentProp);
      } else if (documentType) {
        setLoading(true);
        loadDocumentByType(documentType)
          .then((d) => {
            setDoc(d);
          })
          .finally(() => setLoading(false));
      } else {
        setDoc(null);
      }
    }
  }, [open, documentType, documentProp, loadDocumentByType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {doc?.title ?? doc?.document_type_display ?? "Documento Legal"}
          </DialogTitle>
          <DialogDescription>
            {doc
              ? `Versão ${doc.version} - Efetivo em ${new Date(doc.effective_at).toLocaleDateString("pt-BR")}`
              : loading
                ? "Carregando..."
                : "Selecione um documento para visualizar"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[200px] overflow-y-auto max-h-[60vh] rounded-md border border-border/50 p-4">
          {doc ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
              {doc.content}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingComponent showText={false} className="h-8 w-8" />
            </div>
          ) : (
            <div className="text-muted-foreground text-sm py-8 text-center">
              Nenhum documento para exibir
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
