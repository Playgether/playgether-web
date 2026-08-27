"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TermsLink } from "@/components/terms/TermsLink";
import { getCookieConsent, setCookieConsent } from "@/lib/cookieConsent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  const decide = (value: "accepted" | "rejected") => {
    setCookieConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="animate-slide-up fixed inset-x-0 bottom-0 z-[400] flex justify-center px-4 pb-4 sm:px-6"
    >
      <div className="flex w-full max-w-3xl flex-col gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-card backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
        <p className="text-sm text-muted-foreground">
          Usamos cookies essenciais para você entrar e navegar com segurança na
          Playgether.{" "}
          <TermsLink
            documentType="cookies"
            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
          >
            Política de Cookies
          </TermsLink>
        </p>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={() => decide("rejected")}>
            Rejeitar
          </Button>
          <Button
            size="sm"
            className="bg-gradient-primary text-white border-0"
            onClick={() => decide("accepted")}
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
