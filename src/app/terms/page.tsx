import type { Metadata } from "next";
import { PublicLegalDocument } from "@/components/legal/PublicLegalDocument";

export const metadata: Metadata = {
  title: "Termos de Uso | Playgether",
  description: "Termos de Uso vigentes da Playgether.",
};

export default function TermsPage() {
  return <PublicLegalDocument documentType="terms" fallbackTitle="Termos de Uso" />;
}
