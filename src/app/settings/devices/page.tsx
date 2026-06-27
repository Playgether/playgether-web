"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import type { SessionEntry } from "@/app/api/sessions/route";

function DeviceIcon({ type }: { type?: "desktop" | "mobile" | "tablet" }) {
  const cls = "w-5 h-5 text-primary";
  if (type === "mobile") return <Smartphone className={cls} />;
  if (type === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

function SessionCard({
  session,
  onRevoke,
  revoking,
}: {
  session: SessionEntry;
  onRevoke: (id: string) => void;
  revoking: boolean;
}) {
  const loc = session.location;
  const dev = session.device;
  const locationStr = loc ? `${loc.flag} ${loc.city}${loc.city && loc.country ? ", " : ""}${loc.country}` : null;
  const deviceStr = dev ? `${dev.browser} · ${dev.os}` : null;

  const lastSeen = new Date(session.last_seen_at);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  const lastSeenStr =
    diffMin < 2
      ? "Ativa agora"
      : diffMin < 60
        ? `Ativa há ${diffMin} min`
        : diffH < 24
          ? `Ativa há ${diffH}h`
          : `Ativa há ${diffD} dia${diffD > 1 ? "s" : ""}`;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
        session.is_current ? "bg-primary/10 border border-primary/20" : "bg-muted/20 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <DeviceIcon type={dev?.type} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground truncate">
              {deviceStr ?? "Dispositivo desconhecido"}
            </p>
            {session.is_current && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium shrink-0">
                Atual
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {locationStr && (
              <span className="text-xs text-muted-foreground">{locationStr}</span>
            )}
            {locationStr && <span className="text-xs text-muted-foreground">·</span>}
            <span className="text-xs text-muted-foreground">{lastSeenStr}</span>
          </div>
          {session.ip_address && (
            <span className="text-xs text-muted-foreground/60 font-mono">{session.ip_address}</span>
          )}
        </div>
      </div>

      {!session.is_current && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRevoke(session.session_id)}
          disabled={revoking}
          className="text-xs rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0 ml-3"
        >
          <LogOut className="w-3.5 h-3.5 mr-1" />
          Revogar
        </Button>
      )}
    </div>
  );
}

function SessionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

export default function DevicesSettingsPage() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions/", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as SessionEntry[];
        // current session first
        data.sort((a, b) => (b.is_current ? 1 : 0) - (a.is_current ? 1 : 0));
        setSessions(data);
      }
    } catch {
      CustomToast.error("Erro ao carregar sessões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        CustomToast.success("Sessão revogada com sucesso.");
      } else {
        const data = (await res.json()) as { detail?: string };
        CustomToast.error(data.detail ?? "Erro ao revogar sessão.");
      }
    } catch {
      CustomToast.error("Erro ao revogar sessão.");
    } finally {
      setRevoking(null);
    }
  };

  const current = sessions.find((s) => s.is_current);
  const others = sessions.filter((s) => !s.is_current);

  return (
    <>
      <CustomToaster />
      <SettingsPageWrapper
        title="Dispositivos"
        description="Gerencie os dispositivos e sessões ativas da sua conta."
      >
        <SettingsSection
          title="Sessões ativas"
          description="Dispositivos onde sua conta PlayGether está conectada."
        >
          {loading ? (
            <>
              <SessionSkeleton />
              <SessionSkeleton />
            </>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground px-1 py-4 text-center">
              Nenhuma sessão ativa encontrada.
            </p>
          ) : (
            <>
              {current && (
                <SessionCard
                  session={current}
                  onRevoke={handleRevoke}
                  revoking={revoking === current.session_id}
                />
              )}
              {others.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground px-1 pt-2 font-medium uppercase tracking-wide">
                    Outras sessões
                  </p>
                  {others.map((s) => (
                    <SessionCard
                      key={s.session_id}
                      session={s}
                      onRevoke={handleRevoke}
                      revoking={revoking === s.session_id}
                    />
                  ))}
                </>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchSessions}
                  disabled={loading}
                  className="text-xs text-muted-foreground gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar
                </Button>
              </div>
            </>
          )}
        </SettingsSection>

        <SettingsSection
          title="Notificações push"
          description="Dispositivos configurados para receber notificações."
        >
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex gap-3 text-muted-foreground/30">
              <Smartphone className="w-8 h-8" />
              <Tablet className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum dispositivo móvel registrado ainda.
            </p>
            <Button variant="outline" size="sm" disabled className="text-xs rounded-lg mt-1">
              Em breve
            </Button>
          </div>
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}
