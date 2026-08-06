"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LegalDocumentData } from "@/context/TermsContext";

export function PublicLegalDocument({
  documentType,
  fallbackTitle,
}: {
  documentType: "terms" | "privacy";
  fallbackTitle: string;
}) {
  const [document, setDocument] = useState<LegalDocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/terms/active/${documentType}`);
      if (!response.ok) {
        throw new Error("Documento indisponível");
      }
      setDocument((await response.json()) as LegalDocumentData);
    } catch {
      setDocument(null);
      setError(
        "Não foi possível carregar este documento. Tente novamente em alguns instantes.",
      );
    } finally {
      setLoading(false);
    }
  }, [documentType]);

  useEffect(() => {
    void loadDocument();
  }, [loadDocument]);

  return (
    <main className="min-h-screen bg-gradient-background px-4 py-8 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card/80 p-5 shadow-card backdrop-blur-sm sm:p-8">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar para a Playgether
        </Link>

        {loading ? (
          <div
            className="flex min-h-[45vh] flex-col items-center justify-center gap-3 text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            <p>Carregando documento...</p>
          </div>
        ) : error ? (
          <div
            className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-center"
            role="alert"
          >
            <AlertCircle className="h-9 w-9 text-destructive" aria-hidden />
            <div>
              <h1 className="text-xl font-semibold text-foreground">{fallbackTitle}</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => void loadDocument()}>
              Tentar novamente
            </Button>
          </div>
        ) : document ? (
          <>
            <header className="border-b border-border/70 pb-5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {document.title || document.document_type_display || fallbackTitle}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Versão {document.version} · Em vigor desde{" "}
                {new Date(document.effective_at).toLocaleDateString("pt-BR")}
              </p>
            </header>
            <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap leading-relaxed text-foreground dark:prose-invert">
              {document.content}
            </div>
          </>
        ) : null}
      </article>
    </main>
  );
}
