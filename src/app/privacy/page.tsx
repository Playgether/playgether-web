import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicLegalDocument } from "@/components/legal/PublicLegalDocument";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de Privacidade vigente da Playgether.",
};

export default function PrivacyPage() {
  redirect("/terms?doc=privacy");
}
