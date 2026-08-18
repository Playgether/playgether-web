"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, MessageCircle, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Gamepad2Icon, ChartNoAxesColumn } from "lucide-react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { ApiResponseComments } from "@/context/CommentsContext";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import { getStatsGames } from "@/services/getStatsGames";
import { getGames, type GameDetails } from "@/services/getGames";
import { getCs2Stats } from "@/services/getCs2Stats";
import { getLolStats } from "@/services/getLolStats";
import { GameMediaImage } from "@/components/media/GameMediaImage";

type BioGameStat = {
  slug: "lol" | "csgo";
  matches: number | null;
  hours: number | null;
};

type BioGamesCacheEntry = {
  connectedGames: GameDetails[];
  gameStats: Record<"lol" | "csgo", BioGameStat>;
};

const bioGamesCacheByProfileId = new Map<number, BioGamesCacheEntry>();
const bioGamesPromiseByProfileId = new Map<number, Promise<BioGamesCacheEntry>>();

interface BioTabProps {
  profile: getProfileByUsernameProps | null;
  comments: ApiResponseComments["data"];
  userHasCommented: boolean;
  isOwner: boolean;
  nextPage: string | null;
  isLoadingMore: boolean;
  onAddCommentClick: () => void;
  onEditComment: (commentId: number, newContent: string) => void;
  onDeleteComment: (commentId: number) => void;
  onLoadMore: () => void;
  openConfirmModal: (type: string, data: any) => void;
  setEditingComment: (comment: any) => void;
  setIsEditCommentModalOpen: (open: boolean) => void;
  currentUserUsername?: string | null;
}

export function BioTab({
  profile,
  comments,
  userHasCommented,
  isOwner,
  nextPage,
  isLoadingMore,
  onAddCommentClick,
  onEditComment,
  onDeleteComment,
  onLoadMore,
  openConfirmModal,
  setEditingComment,
  setIsEditCommentModalOpen,
  currentUserUsername,
}: BioTabProps) {
  const [gamesLoading, setGamesLoading] = useState(false);
  const [connectedGames, setConnectedGames] = useState<GameDetails[]>([]);
  const [gameStats, setGameStats] = useState<Record<"lol" | "csgo", BioGameStat>>(
    {} as Record<"lol" | "csgo", BioGameStat>,
  );
  const [isAllGamesModalOpen, setIsAllGamesModalOpen] = useState(false);

  const resolveSlug = (game: GameDetails): "lol" | "csgo" | null => {
    const acronym = (game.acronym ?? "").toLowerCase();
    const name = (game.name ?? "").toLowerCase();
    if (acronym === "lol" || name.includes("league")) return "lol";
    if (acronym === "csgo" || acronym === "cs2" || name.includes("counter")) {
      return "csgo";
    }
    return null;
  };

  useEffect(() => {
    if (!profile?.id) {
      setConnectedGames([]);
      setGameStats({} as Record<"lol" | "csgo", BioGameStat>);
      return;
    }

    const profileId = profile.id;
    const cached = bioGamesCacheByProfileId.get(profileId);
    if (cached) {
      setConnectedGames(cached.connectedGames);
      setGameStats(cached.gameStats);
      setGamesLoading(false);
      return;
    }

    const inFlight = bioGamesPromiseByProfileId.get(profileId);
    if (inFlight) {
      setGamesLoading(true);
      inFlight
        .then((entry) => {
          setConnectedGames(entry.connectedGames);
          setGameStats(entry.gameStats);
        })
        .catch(() => {
          setConnectedGames([]);
          setGameStats({} as Record<"lol" | "csgo", BioGameStat>);
        })
        .finally(() => setGamesLoading(false));
      return;
    }

    setGamesLoading(true);
    const promise = (async (): Promise<BioGamesCacheEntry> => {
      const [catalog, statsGamesResponse] = await Promise.all([
        getGames(),
        getStatsGames(profileId),
      ]);
      const connectedSlugs = new Set(
        (statsGamesResponse.games ?? [])
          .map((g) => g.slug)
          .filter((slug) => slug !== "playgether"),
      );
      const connected = catalog.filter((game) => {
        const slug = resolveSlug(game);
        return slug ? connectedSlugs.has(slug) : false;
      });

      const hasLol = connected.some((game) => resolveSlug(game) === "lol");
      const hasCs = connected.some((game) => resolveSlug(game) === "csgo");

      const [lolResult, csResult] = await Promise.allSettled([
        hasLol
          ? getLolStats(profileId, {
              timeScope: "platform",
              queueScope: "all",
            })
          : Promise.resolve(null),
        hasCs ? getCs2Stats(profileId) : Promise.resolve(null),
      ]);

      const nextStats: Record<"lol" | "csgo", BioGameStat> = {} as Record<
        "lol" | "csgo",
        BioGameStat
      >;

      if (hasLol && lolResult.status === "fulfilled" && lolResult.value?.available) {
        nextStats.lol = {
          slug: "lol",
          matches: lolResult.value.overview?.gamesPlayed ?? null,
          hours: lolResult.value.overview?.timePlayedHours ?? null,
        };
      }

      if (hasCs && csResult.status === "fulfilled" && csResult.value?.available) {
        nextStats.csgo = {
          slug: "csgo",
          matches: csResult.value.stats?.totalMatchesPlayed ?? null,
          hours: csResult.value.stats?.totalHours ?? null,
        };
      }

      return {
        connectedGames: connected,
        gameStats: nextStats,
      };
    })();

    bioGamesPromiseByProfileId.set(profileId, promise);
    promise
      .then((entry) => {
        bioGamesCacheByProfileId.set(profileId, entry);
        setConnectedGames(entry.connectedGames);
        setGameStats(entry.gameStats);
      })
      .catch(() => {
        setConnectedGames([]);
        setGameStats({} as Record<"lol" | "csgo", BioGameStat>);
      })
      .finally(() => {
        bioGamesPromiseByProfileId.delete(profileId);
        setGamesLoading(false);
      });
  }, [profile?.id]);

  const gamesToShow = useMemo(() => connectedGames.slice(0, 3), [connectedGames]);

  const formatHours = (hours: number | null | undefined) => {
    if (hours == null) return "--";
    return Number(hours).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  };

  const formatMatches = (matches: number | null | undefined) => {
    if (matches == null) return "--";
    return Number(matches).toLocaleString("pt-BR");
  };

  const renderGameCard = (game: GameDetails) => {
    const slug = resolveSlug(game);
    const stats = slug ? gameStats[slug] : undefined;
    const usesPlaygetherPostSync = slug === "lol";
    const icon = game.icon ?? game.image ?? null;

    return (
      <div
        key={game.id}
        className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border"
      >
        {icon ? (
          <GameMediaImage
            src={icon}
            alt={game.name}
            size="icon"
            objectFit="cover"
            className="h-8 w-8 rounded"
            spinnerClassName="h-3.5 w-3.5"
          />
        ) : (
          <div className="h-8 w-8 rounded bg-muted" />
        )}
        <div>
          <div className="font-medium text-card-foreground">{game.name}</div>
          <div className="text-sm text-muted-foreground">
            Horas: {formatHours(stats?.hours)}h
            {usesPlaygetherPostSync ? " (pós sincronização na Playgether)" : ""}
          </div>
          <div className="text-sm text-muted-foreground">
            Partidas: {formatMatches(stats?.matches)}
            {usesPlaygetherPostSync ? " (pós sincronização na Playgether)" : ""}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold sm:text-lg">Sobre mim</h3>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {profile?.bio}
      </p>

      <div className="grid grid-cols-1 gap-4 pt-4 sm:gap-6 sm:pt-6 md:grid-cols-2">
        <div className="space-y-4">
          <h4 className="font-semibold text-base flex items-center gap-2 sm:text-lg">
            <Gamepad2Icon className="h-6 w-6 text-card-foreground" />
            Jogos
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {gamesLoading ? (
              <div className="flex items-center justify-center p-4">
                <LoadingComponent showText={false} className="h-5 w-5" />
              </div>
            ) : gamesToShow.length > 0 ? (
              gamesToShow.map((game) => renderGameCard(game))
            ) : (
              <div className="text-sm text-muted-foreground p-3 border border-border rounded-lg">
                Nenhum jogo conectado.
              </div>
            )}
            {connectedGames.length > 3 ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAllGamesModalOpen(true)}
              >
                Ver todos
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-base flex items-center gap-2 sm:text-lg">
            <ChartNoAxesColumn className="h-6 w-6 text-card-foreground" />
            Estatísticas Rápidas
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Horas totais</span>
              <span className="font-semibold text-card-foreground">
                {(profile?.hours_played ?? 0).toLocaleString("pt-BR")}h
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
              <span className="text-muted-foreground">Partidas totais</span>
              <span className="font-semibold text-card-foreground">
                {(profile?.matches_played ?? 0).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAllGamesModalOpen} onOpenChange={setIsAllGamesModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Jogos conectados</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {connectedGames.map((game) => renderGameCard(game))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="pt-8 border-t border-border">
        <h4 className="mb-3 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-lg">
          <MessageCircle className="h-5 w-5 text-card-foreground" />
          Comentários
        </h4>
        <div className="space-y-4">
          {!isOwner && !userHasCommented && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="hover:shadow-card transition-shadow duration-200"
                onClick={onAddCommentClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Comentário
              </Button>
            </div>
          )}
          {comments?.length > 0 ? (
            comments?.map((comment: any) => (
              <div
                key={comment.id}
                className="flex gap-3 rounded-lg border border-border/50 bg-card/30 p-3 sm:p-4"
              >
                <div className="mt-1 shrink-0">
                  <ProfileAvatar
                    displayName={
                      comment.created_by_user_name ?? comment.author ?? "?"
                    }
                    username={comment.user_username}
                    profilePhoto={comment.created_by_user_photo}
                    sizeClass="h-10 w-10"
                    ringClass="ring-2 ring-primary/30"
                    fallbackTextClassName="text-xs"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2 items-start justify-between">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm shrink-0">
                          {comment.created_by_user_name ?? comment.author}
                        </span>
                        <HighlightedAchievementBadges
                          achievements={comment.highlighted_achievements}
                        />
                      </div>
                      <span className="font-light text-xs text-muted-foreground">
                        @{comment.user_username ?? ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp ? (
                          <DateAndHour date={comment.timestamp} />
                        ) : (
                          (comment.time ?? "")
                        )}
                      </span>
                      {comment.edited && (
                        <span className="text-xs text-muted-foreground">
                          (editado)
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.comment ?? comment.content}
                  </p>
                </div>
                {(comment.author === "Você" ||
                  comment.user_username === currentUserUsername) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          setEditingComment(comment);
                          setIsEditCommentModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500 cursor-pointer"
                        onClick={() =>
                          openConfirmModal("deleteComment", comment)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          ) : (
            <div className="flex justify-center">
              <p className="text-muted-foreground">
                Nenhum comentário encontrado
              </p>
            </div>
          )}
          {nextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="hover:shadow-card transition-shadow duration-200"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <LoadingComponent showText={false} className="h-4 w-4" />
                    Carregando...
                  </span>
                ) : (
                  "Carregar mais"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
