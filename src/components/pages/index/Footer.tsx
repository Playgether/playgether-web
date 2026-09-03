"use client";

import React from "react";
import { TermsLink } from "@/components/terms/TermsLink";

const LEGAL_LINK_CLASS =
  "transition-colors hover:text-foreground hover:underline";

const Footer = () => {
  const date = new Date();
  return (
    <footer className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-2 px-4 text-center text-xs tracking-wide text-muted-foreground sm:bottom-8 sm:flex-row sm:justify-center sm:gap-4 sm:text-sm">
      <span>© {date.getFullYear()} ALL RIGHTS RESERVED</span>
      <nav aria-label="Links legais" className="flex items-center gap-3">
        <TermsLink documentType="terms" className={LEGAL_LINK_CLASS}>
          Termos
        </TermsLink>
        <TermsLink documentType="privacy" className={LEGAL_LINK_CLASS}>
          Privacidade
        </TermsLink>
        <TermsLink documentType="community" className={LEGAL_LINK_CLASS}>
          Comunidade
        </TermsLink>
        <TermsLink documentType="cookies" className={LEGAL_LINK_CLASS}>
          Cookies
        </TermsLink>
      </nav>
    </footer>
  );
};

export default Footer;
