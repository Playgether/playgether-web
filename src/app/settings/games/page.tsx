"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { apiFetch } from "@/services/apiFetch";
import { useAuthContext } from "@/context/AuthContext";
interface ConnectionStatus {
  steam: boolean;
  riot: boolean;
}

function GameConnectionRow({
  name,
  icon,
  connected,
  loading,
  onConnect,
  onDisconnect,
  connectLabel,
  comingSoon,
}: {
  name: string;
  icon: React.ReactNode;
  connected?: boolean;
  loading?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  connectLabel?: string;
  comingSoon?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {comingSoon ? (
              <span className="text-xs text-muted-foreground">Em breve</span>
            ) : connected ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">Conectado</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Não conectado</span>
              </>
            )}
          </div>
        </div>
      </div>

      {comingSoon ? (
        <Button variant="outline" size="sm" disabled className="text-xs rounded-lg">
          Em breve
        </Button>
      ) : connected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onDisconnect}
          className="text-xs rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          Desconectar
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={onConnect}
          className="text-xs rounded-lg bg-gradient-primary hover:shadow-glow-primary transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          {connectLabel ?? "Conectar"}
        </Button>
      )}
    </div>
  );
}

export default function GamesSettingsPage() {
  const { user } = useAuthContext();
  const [status, setStatus] = useState<ConnectionStatus>({ steam: false, riot: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    apiFetch(`/api/games/connections/status/`, { method: "GET" })
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setStatus({ steam: !!data.steam_connected, riot: !!data.riot_connected });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleSteamConnect = () => {
    window.location.href = "/api/auth/steam/start/";
  };

  const handleSteamDisconnect = async () => {
    try {
      const resp = await apiFetch("/api/steam/disconnect/", { method: "POST" });
      if (resp.ok) {
        setStatus((s) => ({ ...s, steam: false }));
        CustomToast.success("Steam desconectada!");
      }
    } catch {
      CustomToast.error("Erro ao desconectar Steam.");
    }
  };

  const platforms = [
    {
      name: "Steam",
      icon: "🎮",
      connected: status.steam,
      onConnect: handleSteamConnect,
      onDisconnect: handleSteamDisconnect,
      connectLabel: "Conectar Steam",
      comingSoon: false,
    },
    {
      name: "Riot Games (LoL / Valorant)",
      icon: "⚔️",
      connected: status.riot,
      onConnect: () => {},
      onDisconnect: () => {},
      connectLabel: "Conectar Riot",
      comingSoon: false,
    },
    { name: "Xbox", icon: "🎯", comingSoon: true },
    { name: "PlayStation", icon: "🕹️", comingSoon: true },
    { name: "Battle.net", icon: "🔵", comingSoon: true },
    { name: "Epic Games", icon: "🏆", comingSoon: true },
  ];

  return (
    <>
      <CustomToaster />
      <SettingsPageWrapper
        title="Jogos Conectados"
        description="Conecte suas contas de plataformas de jogos para sincronizar estatísticas e conquistas."
      >
        <SettingsSection
          title="Plataformas de jogos"
          description="Vincule suas contas para mostrar suas estatísticas no perfil."
        >
          {platforms.map((platform) => (
            <GameConnectionRow
              key={platform.name}
              loading={loading && !platform.comingSoon}
              {...platform}
            />
          ))}
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}
