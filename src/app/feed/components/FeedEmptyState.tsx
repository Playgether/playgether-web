"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, DoorOpen, PenLine, Search, UserPlus } from "lucide-react";
import type { FeedMode } from "../types/FeedMode";

interface FeedEmptyStateProps {
  mode: FeedMode;
  onCreatePost: () => void;
}

export function FeedEmptyState({
  mode,
  onCreatePost,
}: FeedEmptyStateProps) {
  const isFollowing = mode === "following";

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border/50 bg-card/50 px-6 py-12 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        {isFollowing ? (
          <UserPlus className="h-7 w-7 text-primary" />
        ) : (
          <Compass className="h-7 w-7 text-primary" />
        )}
      </div>

      <h3 className="mb-2 text-lg font-bold text-foreground">
        {isFollowing
          ? "Seu feed está começando"
          : "Nada para explorar ainda"}
      </h3>

      <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isFollowing
          ? "Siga outros jogadores ou publique algo para ver posts aqui. A comunidade está crescendo — seja um dos primeiros!"
          : "Ainda não há posts públicos de outros jogadores. Volte em breve ou publique algo para animar a comunidade."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={onCreatePost}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          <PenLine className="mr-2 h-4 w-4" />
          Publicar
        </Button>

        {isFollowing ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Encontrar jogadores
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/rooms">
                <DoorOpen className="mr-2 h-4 w-4" />
                Ver salas
              </Link>
            </Button>
          </>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Encontrar jogadores
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
