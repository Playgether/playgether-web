"use client";

import React from "react";
import { TermsLink } from "@/components/terms/TermsLink";

const LEGAL_LINK_CLASS =
  "transition-colors hover:text-foreground hover:underline";

const Footer = () => {
  const date = new Date();
  return (
    <footer className="absolute bottom-6 left-0 right-0 z-10 flex justify-center px-4 sm:bottom-8">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-5 py-2 text-center text-xs font-medium tracking-wide text-foreground/75 shadow-sm backdrop-blur-md sm:flex-row sm:gap-4 sm:rounded-full sm:text-sm dark:border-transparent dark:bg-transparent dark:px-0 dark:py-0 dark:font-normal dark:text-muted-foreground dark:shadow-none dark:backdrop-blur-none">
        <span>© {date.getFullYear()} ALL RIGHTS RESERVED</span>
        <nav aria-label="Links legais" className="flex items-center gap-3">
          <Link className="transition-colors hover:text-primary hover:underline dark:hover:text-foreground" href="/terms">
            Termos
          </Link>
          <Link className="transition-colors hover:text-primary hover:underline dark:hover:text-foreground" href="/privacy">
            Privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
