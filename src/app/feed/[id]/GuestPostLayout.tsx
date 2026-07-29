"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
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
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-[0.12em] sm:tracking-[0.16em]"
          >
            <span className="text-secondary">PLAY</span>
            <span className="text-neon-blue">GETHER</span>
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
