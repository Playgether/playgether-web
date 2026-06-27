"use client";

import {
  listRoomActiveSanctions,
  revokeRoomSanction,
  type RoomActiveSanctionRow,
} from "@/actions/roomRolesActions";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { cn } from "@/lib/utils";
import { Ban, Loader2, ShieldAlert, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

const TYPE_LABEL: Record<string, string> = {
  mute: "Silenciado",
  ban: "Expulso da sala",
  ambience_ban: "Expulso da transmissão",
};

function formatRemaining(seconds: number | null, isPermanent: boolean): string {
  if (isPermanent) return "Permanente";
  if (seconds == null) return "Ativo";
  if (seconds < 60) return `${seconds}s restantes`;
  const min = Math.max(1, Math.round(seconds / 60));
  if (min < 60) return `${min} min restante${min !== 1 ? "s" : ""}`;
  const h = Math.round(seconds / 3600);
  return `${h}h restantes`;
}

export function RoomModerationSanctionsPanel({ roomSlug }: { roomSlug: string }) {
  const { can } = useRoomPermissions();
  const canKick = can("members.kick");
  const canMute = can("members.mute");
  const [rows, setRows] = useState<RoomActiveSanctionRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    const res = await listRoomActiveSanctions(roomSlug);
    setIsLoading(false);
    if (!res.ok) {
      setLoadError(res.error);
      setRows([]);
      return;
    }
    setRows(res.data);
  }, [roomSlug]);

  useEffect(() => {
    if (!canKick && !canMute) return;
    void load();
  }, [canKick, canMute, load]);

  if (!canKick && !canMute) return null;

  const handleRevoke = (userId: number, sanctionType: string) => {
    startTransition(async () => {
      const res = await revokeRoomSanction(roomSlug, userId, sanctionType);
      if (!res.ok) {
        setLoadError(res.error);
        return;
      }
      await load();
    });
  };

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
      <div className="mb-4 flex items-center gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Moderação
          </p>
          <p className="text-sm text-muted-foreground">
            Silenciamentos e expulsões ativos nesta sala
          </p>
        </div>
      </div>

      {loadError ? (
        <p className="mb-3 text-sm font-medium text-destructive">{loadError}</p>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando…
        </div>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma sanção ativa no momento.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const Icon =
              row.sanction_type === "mute"
                ? VolumeX
                : row.sanction_type === "ambience_ban"
                  ? Ban
                  : Ban;
            return (
              <li
                key={`${row.user_id}-${row.sanction_type}-${row.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/50 px-3 py-3"
              >
                <ProfileAvatar
                  displayName={row.fullname || row.username}
                  username={row.username}
                  profilePhoto={row.profile_photo}
                  sizeClass="h-10 w-10"
                  fallbackTextClassName="text-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {row.fullname || row.username}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 shrink-0" />
                    {TYPE_LABEL[row.sanction_type] ?? row.sanction_type}
                    <span aria-hidden>·</span>
                    {formatRemaining(row.remaining_seconds, row.is_permanent)}
                  </p>
                  {row.reason ? (
                    <p className="truncate text-xs text-muted-foreground/90">
                      {row.reason}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="default"
                  variant="outline"
                  className="h-9 shrink-0 px-4 text-sm"
                  disabled={isPending}
                  onClick={() => handleRevoke(row.user_id, row.sanction_type)}
                >
                  Remover
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => void load()}
        disabled={isLoading || isPending}
        className={cn(
          "mt-3 w-full text-center text-sm font-medium text-muted-foreground underline-offset-2 hover:underline",
          (isLoading || isPending) && "pointer-events-none opacity-50",
        )}
      >
        Atualizar lista
      </button>
    </div>
  );
}
