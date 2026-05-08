"use client";

import { validateRoomAction } from "@/actions/validateRoom";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export interface RoomCardData {
  id: number;
  slug: string;
  name: string;
  summary: string;
  banner: string | null;
  capacity: number;
  peakUsers: number;
  totalMessages: number;
  isFavorited: boolean;
  /** Usuários online agora (polling); fallback visual usa peakUsers. */
  onlineNow?: number;
}

interface RoomCardProps {
  room: RoomCardData;
  isFavorite: boolean;
  onToggleFavorite: (roomId: number, favorite: boolean) => void;
}

export default function RoomCard({
  room,
  isFavorite,
  onToggleFavorite,
}: RoomCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEnter = async () => {
    startTransition(async () => {
      const result = await validateRoomAction(room.slug);

      if (result.success) {
        router.push(`/rooms/${room.slug}`);
        return;
      }

      setError(result.message);
    });
  };

  return (
    <Card className="relative overflow-hidden border-border bg-card shadow-improved card-hover-effect animate-fade-up">
      <div className="relative h-52 overflow-hidden bg-muted/40 sm:h-56">
        {room.banner ? (
          <ImageComponent
            media_id={room.banner}
            alt={room.name}
            className="transition-transform duration-300 hover:scale-105"
          />
        ) : null}
        <button
          type="button"
          onClick={() => onToggleFavorite(room.id, !isFavorite)}
          className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-transform hover:scale-110"
          aria-label={
            isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite && "fill-current text-neon-grandmaster"
            )}
          />
        </button>
      </div>

      <div className="flex min-h-[176px] flex-col p-4">
        <h3 className="mb-1 text-lg font-bold text-card-foreground hyphens-none whitespace-normal">
          {room.name}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {room.summary}
        </p>

        {error ? (
          <div className="mb-3 rounded border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            onClick={handleEnter}
            disabled={isPending}
            className="gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:shadow-glow-primary"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </Button>

          <div className="flex items-center gap-3 text-sm">
            <div
              className="flex items-center gap-1.5"
              title={`Online agora (atualiza automaticamente). Pico histórico: ${room.peakUsers}`}
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-neon-green">
                {room.onlineNow !== undefined ? room.onlineNow : "—"}
              </span>
              <span className="text-muted-foreground">/ {room.capacity}</span>
            </div>
            <div
              className="hidden items-center gap-1.5 text-muted-foreground sm:flex"
              title="Mensagens totais"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{room.totalMessages}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
