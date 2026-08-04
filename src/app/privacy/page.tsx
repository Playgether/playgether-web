import type { Metadata } from "next";
import { PublicLegalDocument } from "@/components/legal/PublicLegalDocument";

export const metadata: Metadata = {
  title: "Política de Privacidade | Playgether",
  description: "Política de Privacidade vigente da Playgether.",
};

export default function PrivacyPage() {
  return (
    <PublicLegalDocument
      documentType="privacy"
      fallbackTitle="Política de Privacidade"
    />
  );
}
