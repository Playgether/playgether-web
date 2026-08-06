"use client";

import Link from "next/link";
import React from "react";

const Footer = () => {
  const date = new Date();
  return (
    <footer className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-2 px-4 text-center text-xs tracking-wide text-muted-foreground sm:bottom-8 sm:flex-row sm:justify-center sm:gap-4 sm:text-sm">
      <span>© {date.getFullYear()} ALL RIGHTS RESERVED</span>
      <nav aria-label="Links legais" className="flex items-center gap-3">
        <Link className="transition-colors hover:text-foreground hover:underline" href="/terms">
          Termos
        </Link>
        <Link className="transition-colors hover:text-foreground hover:underline" href="/privacy">
          Privacidade
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
