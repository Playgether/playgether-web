"use client";

import { validateRoomAction } from "@/actions/validateRoom";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, Heart, MessageCircle, ShieldAlert, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

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
  /** Aviso de expulsão desta sala (vindo da lista após redirect). */
  expelledNotice?: string | null;
}

export default function RoomCard({
  room,
  isFavorite,
  onToggleFavorite,
  expelledNotice = null,
}: RoomCardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [accessError, setAccessError] = useState<string | null>(null);
  const [roomBanned, setRoomBanned] = useState(false);
  const [isPending, startTransition] = useTransition();

  const banMessage = expelledNotice ?? accessError;
  const enterDisabled = isPending || roomBanned || Boolean(expelledNotice);

  useEffect(() => {
    let cancelled = false;
    void validateRoomAction(room.slug).then((result) => {
      if (cancelled) return;
      if (!result.success && result.roomBanned) {
        setRoomBanned(true);
        setAccessError(result.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [room.slug, expelledNotice]);

  useEffect(() => {
    if (expelledNotice) {
      setRoomBanned(true);
      setAccessError(expelledNotice);
    }
  }, [expelledNotice]);

  const handleEnter = () => {
    if (enterDisabled) return;
    startTransition(async () => {
      const result = await validateRoomAction(room.slug);

      if (result.success) {
        router.push(`/rooms/${room.slug}`);
        return;
      }

      if (result.roomBanned) {
        setRoomBanned(true);
      }
      setAccessError(result.message);
    });
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border bg-card shadow-improved card-hover-effect animate-fade-up",
        roomBanned && "border-destructive/25",
      )}
    >
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
              isFavorite && "fill-current text-neon-grandmaster",
            )}
          />
        </button>
      </div>

      <div className="flex min-h-[176px] flex-col p-4">
        <h3 className="mb-1 text-lg font-bold text-card-foreground hyphens-none whitespace-normal">
          {room.name}
        </h3>
        <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {room.summary}
        </p>

        <AnimatePresence mode="wait">
          {banMessage ? (
            <motion.div
              key={banMessage}
              role="alert"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-2.5"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-destructive/90">
                  Acesso bloqueado
                </p>
                <p className="text-xs font-medium leading-snug text-destructive">
                  {banMessage}
                </p>
                {roomBanned ? (
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-destructive/80">
                    <Clock className="h-3 w-3 shrink-0" />
                    Aguarde o tempo da punição para entrar novamente.
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-auto flex items-center justify-between gap-3">
          <Button
            type="button"
            onClick={handleEnter}
            disabled={enterDisabled}
            className={cn(
              "gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:shadow-glow-primary",
              enterDisabled && "cursor-not-allowed opacity-50",
            )}
          >
            {isPending
              ? "Entrando..."
              : roomBanned
                ? "Bloqueado"
                : "Entrar"}
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
