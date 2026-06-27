"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { apiFetch } from "@/services/apiFetch";
import { getGames, type GameDetails } from "@/services/getGames";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { useAuthContext } from "@/context/AuthContext";
import { disconnectSteam } from "@/services/disconnectSteam";

interface PlatformStatus {
  connected: boolean;
  nickname: string | null;
  avatar: string | null;
  steam_profile_public: boolean;
}

interface ConnectionsStatus {
  platforms: Record<string, PlatformStatus>;
}

function resolveMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return getCloudinaryUrl(value);
}

function classifyGame(game: GameDetails): "steam" | "riot" | null {
  const slug = (game.platform_slug ?? "").toLowerCase();
  const acronym = (game.acronym ?? "").toLowerCase();
  const name = (game.name ?? "").toLowerCase();

  if (slug === "steam" || acronym === "csgo" || acronym === "cs2" || name.includes("counter")) {
    return "steam";
  }
  if (slug === "riot" || acronym === "lol" || name.includes("league") || name.includes("valorant")) {
    return "riot";
  }
  return null;
}

function handleConnectSteam() {
  fetch("/api/auth/steam/start", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ next: "/settings/games" }),
  })
    .then((r) => r.json())
    .then((data: { redirect_url?: string }) => {
      if (data.redirect_url) window.location.href = data.redirect_url;
    })
    .catch(() => {});
}

function GameIcon({ icon, image, avatar, name }: { icon?: string | null; image?: string | null; avatar?: string | null; name: string }) {
  const src = resolveMediaUrl(avatar ?? icon ?? image);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-10 h-10 rounded-xl object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="11" width="4" height="6" rx="1"/><rect x="14" y="11" width="4" height="2" rx="1"/><circle cx="16" cy="16" r="1"/><path d="M6 7h4"/><path d="M8 5v4"/><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/></svg>
    </div>
  );
}

function GameRow({
  game,
  platform,
  status,
  loading,
  onConnect,
  onDisconnect,
}: {
  game: GameDetails;
  platform: "steam" | "riot" | null;
  status: PlatformStatus | null;
  loading: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    );
  }

  const comingSoon = !platform;
  const connected = status?.connected ?? false;
  const avatar = connected ? (status?.avatar ?? null) : null;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <GameIcon icon={game.icon} image={game.image} avatar={avatar} name={game.name} />
        <div>
          <p className="text-sm font-medium text-foreground">{game.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {comingSoon ? (
              <span className="text-xs text-muted-foreground">Em breve</span>
            ) : connected ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-500">
                <CheckCircle2 className="w-3 h-3" />
                Conectado
                {status?.nickname && (
                  <span className="text-muted-foreground ml-1">· {status.nickname}</span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <XCircle className="w-3 h-3" />
                Não conectado
              </span>
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
          disabled={!onConnect}
          className="text-xs rounded-lg bg-gradient-primary hover:shadow-glow-primary transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          {platform === "steam" ? "Conectar Steam" : "Conectar Riot"}
        </Button>
      )}
    </div>
  );
}

export default function GamesSettingsPage() {
  const { user } = useAuthContext();
  const [connections, setConnections] = useState<ConnectionsStatus>({ platforms: {} });
  const [games, setGames] = useState<GameDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;

    Promise.all([
      apiFetch("/api/games/connections/status/", { method: "GET", credentials: "include" })
        .then(async (r) => r.ok ? (r.json() as Promise<ConnectionsStatus>) : null)
        .catch(() => null),
      getGames().catch(() => [] as GameDetails[]),
    ]).then(([statusData, catalog]) => {
      if (statusData) setConnections(statusData);
      setGames((catalog as GameDetails[]).filter((g) => g.platform_slug !== "playgether"));
    }).finally(() => setLoading(false));
  }, [user]);

  const handleDisconnect = async (platform: string) => {
    if (platform === "steam") {
      try {
        await disconnectSteam();
        setConnections((prev) => ({
          platforms: {
            ...prev.platforms,
            steam: { connected: false, nickname: null, avatar: null, steam_profile_public: false },
          },
        }));
        CustomToast.success("Steam desconectada!");
      } catch {
        CustomToast.error("Erro ao desconectar a Steam.");
      }
    }
  };

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
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <GameRow key={i} game={{} as GameDetails} platform={null} status={null} loading />
              ))
            : games.map((game) => {
                const platform = classifyGame(game);
                const status = platform ? (connections.platforms[platform] ?? null) : null;

                return (
                  <GameRow
                    key={game.id}
                    game={game}
                    platform={platform}
                    status={status}
                    loading={false}
                    onConnect={platform === "steam" ? handleConnectSteam : undefined}
                    onDisconnect={platform ? () => handleDisconnect(platform) : undefined}
                  />
                );
              })}
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}
