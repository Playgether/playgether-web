"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveExpiryLabel } from "../../hooks/useLiveExpiryLabel";
import {
  ArrowLeft,
  Clock,
  ListRestart,
  LogOut,
  Pencil,
  Users,
} from "lucide-react";
import type { Game } from "../../types/duo";
import type { DuoQueue } from "../../types/duo";
import { getActiveQueues, leaveQueue, renewQueue } from "../../services/duoApi";

interface QueueManagementStepProps {
  game: Game;
  queue: DuoQueue;
  onBack: () => void;
  onQueueUpdated: (queue: DuoQueue) => void;
  onLeftQueue: () => void;
  onEditPreferences: () => void;
  /** Acesso rápido à tela de resultados com as preferências atuais da fila. */
  onGoToSearch?: () => void;
  /** Fila expirou (TTL) — preferências já estão no estado do pai. */
  onQueueTtlExpired?: () => void;
}

export function QueueManagementStep({
  game,
  queue,
  onBack,
  onQueueUpdated,
  onLeftQueue,
  onEditPreferences,
  onGoToSearch,
  onQueueTtlExpired,
}: QueueManagementStepProps) {
  const [busy, setBusy] = useState<"renew" | "leave" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const liveRemaining = useLiveExpiryLabel(queue.expires_at);
  const ttlNavigateRef = useRef(false);

  const canRenew = queue.is_near_expiry;

  useEffect(() => {
    if (!onQueueTtlExpired || !queue.expires_at) return;
    const slug = game.acronym.toLowerCase();
    let cancelled = false;

    const tick = async () => {
      if (new Date(queue.expires_at).getTime() > Date.now()) return;
      if (ttlNavigateRef.current) return;
      try {
        const queues = await getActiveQueues();
        if (cancelled) return;
        const still = queues.find(
          (q) => q.id === queue.id && (q.game_slug || "").toLowerCase() === slug
        );
        if (!still) {
          ttlNavigateRef.current = true;
          onQueueTtlExpired();
        }
      } catch {
        /* ignore */
      }
    };

    const id = window.setInterval(() => void tick(), 2000);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [onQueueTtlExpired, queue.expires_at, queue.id, game.acronym]);

  async function handleRenew() {
    setError(null);
    setBusy("renew");
    try {
      const updated = await renewQueue(queue.id);
      onQueueUpdated(updated);
    } catch (e: any) {
      setError(e?.message || "Não foi possível renovar.");
    } finally {
      setBusy(null);
    }
  }

  async function handleLeave() {
    setError(null);
    setBusy("leave");
    try {
      await leaveQueue(queue.id);
      onLeftQueue();
    } catch (e: any) {
      setError(e?.message || "Não foi possível sair da fila.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-layout-main w-full max-w-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-in-up">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Outros jogos</span>
        </button>

        <div className="card-glass rounded-xl p-8 text-center border border-primary/20">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/15 p-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            Você já está na fila
          </h1>
          <p className="text-muted-foreground mb-2">
            <span className="text-primary font-medium">{game.name}</span>
            {" · "}continuar de onde parou ou ajustar sua busca.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Tempo restante na fila:{" "}
              <strong className="text-card-foreground font-medium font-mono tabular-nums">
                {liveRemaining ?? "—"}
              </strong>
            </span>
          </div>

          {error ? (
            <p className="text-destructive text-sm mb-4">{error}</p>
          ) : null}

          <div className="flex flex-col gap-3">
            {canRenew ? (
              <Button
                type="button"
                variant="outline"
                className="w-full border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                disabled={busy !== null}
                onClick={handleRenew}
              >
                <ListRestart className="w-4 h-4 mr-2" />
                {busy === "renew" ? "Renovando…" : "Renovar tempo na fila"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center -my-1">
                Renovação disponível quando restarem menos de 5 horas.
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              disabled={busy !== null}
              onClick={onEditPreferences}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar preferências
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              disabled={busy !== null}
              onClick={handleLeave}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {busy === "leave" ? "Saindo…" : "Sair da fila"}
            </Button>
          </div>

          {onGoToSearch ? (
            <button
              type="button"
              className="mt-4 text-xs text-primary hover:underline disabled:opacity-50"
              disabled={busy !== null}
              onClick={onGoToSearch}
            >
              Ir para a busca de duos (mesmas preferências)
            </button>
          ) : null}

          <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
            Em <strong className="text-card-foreground font-medium">Editar preferências</strong>, avance
            até o fim do fluxo para voltar à busca. O tempo na fila só é{" "}
            <strong className="text-card-foreground font-medium">reiniciado</strong> se você alterar
            alguma preferência em relação ao que estava salvo.
          </p>
        </div>
      </div>
    </div>
  );
}
