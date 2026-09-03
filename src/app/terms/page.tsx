import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicLegalDocument } from "@/components/legal/PublicLegalDocument";
import { TermsQueryModalOpener } from "@/components/terms/TermsQueryModalOpener";

export const metadata: Metadata = {
  title: "Termos de Uso | Playgether",
  description: "Termos de Uso vigentes da Playgether.",
};

export default function TermsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <TermsQueryModalOpener />
      </Suspense>
      <PublicLegalDocument documentType="terms" fallbackTitle="Termos de Uso" />
    </>
  );
}
