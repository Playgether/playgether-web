"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { BrandLogo } from "@/components/general/BrandLogo";
import Link from "next/link";
import Login from "@/components/pages/index/Login";
import Cadastro from "@/components/pages/index/Cadastro";
import { Button } from "@/components/ui/button";

type AuthOverlay = "login" | "cadastro" | null;

interface GuestPostLayoutProps {
  children: ReactNode;
}

/**
 * Slim chrome for unauthenticated shared-post views.
 * Full feed sidebar / messages / create-post stay behind auth.
 */
export function GuestPostLayout({ children }: GuestPostLayoutProps) {
  const [overlay, setOverlay] = useState<AuthOverlay>(null);

  return (
    <div
      className="min-h-screen w-full bg-background"
      style={
        {
          "--layout-header-height": "3.5rem",
          "--layout-quick-messages-height": "0px",
          "--layout-bottom-nav-height": "0px",
        } as CSSProperties
      }
    >
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center" aria-label="Playgether">
            <BrandLogo className="h-8 w-auto sm:h-9" priority />
          </Link>
          <Button
            type="button"
            size="sm"
            className="font-semibold"
            onClick={() => setOverlay("login")}
          >
            Entrar
          </Button>
        </div>
      </header>

      <main className="pb-10 pt-2">{children}</main>

      {overlay === "login" ? (
        <Login
          onClickX={() => setOverlay(null)}
          onClickAqui={() => setOverlay("cadastro")}
          redirectTo={
            typeof window !== "undefined" ? window.location.pathname : "/feed"
          }
        />
      ) : null}
      {overlay === "cadastro" ? (
        <Cadastro
          onClickX={() => setOverlay(null)}
          onClickAqui={() => setOverlay("login")}
        />
      ) : null}
    </div>
  );
}
