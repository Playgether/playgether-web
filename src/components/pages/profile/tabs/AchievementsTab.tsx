"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import {
  getProfileAchievements,
  type ProfileAchievementApi,
} from "@/services/getProfileAchievements";
import { refreshProfileAchievements } from "@/services/refreshProfileAchievements";
import { getStatsGames, type StatsGame } from "@/services/getStatsGames";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { ConquistText } from "../ConquistText";
import type { AchievementType } from "../modals/AchievementModal";
import { CustomToast } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";

function isProfileOwner(
  user: { username?: string; user_id?: number } | null,
  profile: getProfileByUsernameProps | null,
): boolean {
  if (!user || !profile) return false;
  if (
    typeof user.user_id === "number" &&
    typeof profile.user_id === "number" &&
    user.user_id === profile.user_id
  ) {
    return true;
  }
  const u = user.username?.toLowerCase() ?? "";
  const p = profile.username?.toLowerCase() ?? "";
  return u.length > 0 && u === p;
}

const SLUG_LABELS: Record<string, string> = {
  playgether: "Playgether",
  csgo: "Counter-Strike 2",
  lol: "League of Legends",
  valorant: "Valorant",
};

const achievementsCacheByProfileId = new Map<number, ProfileAchievementApi[]>();
const achievementsPromiseByProfileId = new Map<
  number,
  Promise<ProfileAchievementApi[]>
>();

const statsGamesCacheByProfileId = new Map<number, StatsGame[]>();
const statsGamesPromiseByProfileId = new Map<number, Promise<StatsGame[]>>();

function toModalAchievement(
  a: ProfileAchievementApi,
  sessionNewIds: Set<number>,
): AchievementType {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    rarity: a.rarity,
    icon: a.icon,
    game: a.game,
    date: a.unlocked && a.date ? a.date : "Não desbloqueada",
    percentage: a.percentage,
    progression: a.progression
      ? {
          current: a.progression.current,
          next: a.progression.next,
          path: a.progression.path,
          unit: a.progression.unit,
        }
      : undefined,
    recentlyUnlocked: a.unlocked && sessionNewIds.has(a.id),
  };
}

interface AchievementsTabProps {
  profile: getProfileByUsernameProps | null;
  isOwner: boolean;
  onAchievementClick: (achievement: AchievementType) => void;
}

export function AchievementsTab({
  profile,
  isOwner: isOwnerFromParent,
  onAchievementClick,
}: AchievementsTabProps) {
  const { user } = useAuthContext();
  const isOwner = isProfileOwner(user, profile) || isOwnerFromParent;

  const [achievements, setAchievements] = useState<ProfileAchievementApi[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [statsGames, setStatsGames] = useState<StatsGame[]>([]);
  const [loadingStatsGames, setLoadingStatsGames] = useState(false);
  const [sessionNewIds, setSessionNewIds] = useState(() => new Set<number>());
  const [filterSessionOnly, setFilterSessionOnly] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [pickSlug, setPickSlug] = useState<string>("");
  const [syncBusy, setSyncBusy] = useState(false);
  /** Slugs cujas conquistas aparecem na grade (pode combinar vários). */
  const [selectedGameSlugs, setSelectedGameSlugs] = useState<Set<string>>(
    () => new Set(),
  );

  const profileId = profile?.id;

  useEffect(() => {
    setSessionNewIds(new Set());
    setFilterSessionOnly(false);
    setSelectedGameSlugs(new Set());
  }, [profileId]);

  useEffect(() => {
    if (!profileId) {
      setStatsGames([]);
      return;
    }
    const cached = statsGamesCacheByProfileId.get(profileId);
    if (cached !== undefined) {
      setStatsGames(cached);
      return;
    }
    const existing = statsGamesPromiseByProfileId.get(profileId);
    if (existing) {
      existing.then(setStatsGames).catch(() => setStatsGames([]));
      return;
    }
    setLoadingStatsGames(true);
    const p = getStatsGames(profileId)
      .then((data) => {
        statsGamesCacheByProfileId.set(profileId, data.games);
        return data.games;
      })
      .catch(() => {
        statsGamesCacheByProfileId.set(profileId, []);
        return [] as StatsGame[];
      })
      .finally(() => {
        statsGamesPromiseByProfileId.delete(profileId);
        setLoadingStatsGames(false);
      });
    statsGamesPromiseByProfileId.set(profileId, p);
    p.then(setStatsGames).catch(() => setStatsGames([]));
  }, [profileId]);

  /**
   * Quando a lista de jogos conectados muda: primeira carga marca todos;
   * depois, preserva escolhas e só inclui jogos novos (ligados por padrão).
   */
  useEffect(() => {
    if (statsGames.length === 0) return;
    setSelectedGameSlugs((prev) => {
      const avail = new Set<string>(statsGames.map((g) => g.slug));
      if (prev.size === 0) {
        return new Set(avail);
      }
      const next = new Set<string>();
      for (const s of prev) {
        if (avail.has(s)) next.add(s);
      }
      for (const s of avail) {
        if (!prev.has(s)) next.add(s);
      }
      return next;
    });
  }, [statsGames]);

  const loadAchievements = useCallback(
    async (opts?: { bypassCache?: boolean }) => {
      if (!profileId) return;
      if (opts?.bypassCache) {
        achievementsCacheByProfileId.delete(profileId);
        achievementsPromiseByProfileId.delete(profileId);
      }
      const cached = achievementsCacheByProfileId.get(profileId);
      if (cached !== undefined && !opts?.bypassCache) {
        setAchievements(cached);
        return;
      }
      const existing = achievementsPromiseByProfileId.get(profileId);
      if (existing && !opts?.bypassCache) {
        existing.then(setAchievements).catch(() => setAchievements([]));
        return;
      }
      setLoadingList(true);
      const p = getProfileAchievements(profileId)
        .then((data) => {
          achievementsCacheByProfileId.set(profileId, data.achievements);
          return data.achievements;
        })
        .catch(() => {
          achievementsCacheByProfileId.set(profileId, []);
          return [];
        })
        .finally(() => {
          achievementsPromiseByProfileId.delete(profileId);
          setLoadingList(false);
        });
      achievementsPromiseByProfileId.set(profileId, p);
      p.then(setAchievements).catch(() => setAchievements([]));
    },
    [profileId],
  );

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const slugOrder = useMemo(() => statsGames.map((g) => g.slug), [statsGames]);

  const openSyncDialog = () => {
    setPickSlug(slugOrder[0] ?? "");
    setSyncDialogOpen(true);
  };

  const handleConfirmSync = async () => {
    if (!profileId || !isOwner || !pickSlug || syncBusy) return;

    const unlockedBefore = new Set(
      achievements.filter((a) => a.unlocked).map((a) => a.id),
    );

    setSyncBusy(true);
    try {
      const result = await refreshProfileAchievements(profileId, pickSlug);

      const trulyNewIds = result.newly_unlocked_ids.filter(
        (id) => !unlockedBefore.has(id),
      );

      if (trulyNewIds.length > 0) {
        setSessionNewIds((prev) => {
          const next = new Set(prev);
          for (const id of trulyNewIds) {
            next.add(id);
          }
          return next;
        });
      }

      await loadAchievements({ bypassCache: true });

      if (trulyNewIds.length > 0) {
        CustomToast.success(
          trulyNewIds.length === 1
            ? "Você desbloqueou 1 conquista que ainda não tinha!"
            : `Você desbloqueou ${trulyNewIds.length} conquistas que ainda não tinha!`,
          { duration: CustomToastProps.defaultDuration },
        );
      } else {
        CustomToast.neutral(
          "Nenhuma conquista nova desta vez. Ou você já tinha todas as disponíveis para estes dados, ou ainda não atingiu os requisitos.",
          { duration: CustomToastProps.defaultDuration },
        );
      }

      setSyncBusy(false);
      setTimeout(() => setSyncDialogOpen(false), 320);
    } catch (e) {
      setSyncBusy(false);
      CustomToast.error(
        e instanceof Error
          ? e.message
          : "Não foi possível atualizar conquistas",
        { duration: CustomToastProps.defaultDuration },
      );
    }
  };

  const displayedAchievements = useMemo(() => {
    let list = achievements;
    if (filterSessionOnly && sessionNewIds.size > 0) {
      list = list.filter((a) => sessionNewIds.has(a.id));
    }
    if (selectedGameSlugs.size > 0) {
      list = list.filter((a) => selectedGameSlugs.has(a.game_slug));
    }
    return list;
  }, [achievements, filterSessionOnly, sessionNewIds, selectedGameSlugs]);

  const toggleGameFilter = (slug: string) => {
    setSelectedGameSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAllGameFilters = () => {
    setSelectedGameSlugs(new Set(slugOrder));
  };

  const clearGameFilters = () => {
    setSelectedGameSlugs(new Set());
  };

  if (!profileId) {
    return <p className="text-muted-foreground text-sm">Carregando perfil…</p>;
  }

  return (
    <div className="space-y-6">
      {loadingStatsGames && slugOrder.length === 0 ? (
        <LoadingComponent
          text="Carregando jogos…"
          showText
          className="min-h-[100px]"
        />
      ) : slugOrder.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar as conexões de jogos.
        </p>
      ) : (
        <>
          {isOwner && (
            <div className="rounded-lg border border-border bg-card/40 p-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                Sincroniza dados do jogo escolhido e verifica desbloqueios. Não
                depende do filtro da lista acima.
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={syncBusy}
                className="shrink-0"
                onClick={openSyncDialog}
              >
                Atualizar Conquistas
              </Button>
            </div>
          )}
          <div className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Filtrar por jogo
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mostre só as conquistas dos jogos marcados. Pode combinar
                  vários (ex.: CS2 e outro).
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={selectAllGameFilters}
                >
                  Marcar todos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={clearGameFilters}
                >
                  Limpar filtro
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {slugOrder.map((slug) => {
                const label = SLUG_LABELS[slug] ?? slug;
                const checked = selectedGameSlugs.has(slug);
                const id = `achievement-filter-${slug}`;
                return (
                  <div key={slug} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggleGameFilter(slug)}
                    />
                    <Label
                      htmlFor={id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {sessionNewIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Switch
              id="filter-session-achievements"
              checked={filterSessionOnly}
              onCheckedChange={setFilterSessionOnly}
            />
            <Label
              htmlFor="filter-session-achievements"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Só novas nesta sessão
            </Label>
          </div>
        )}
      </div>

      {loadingList && achievements.length === 0 ? (
        <LoadingComponent
          text="Carregando conquistas…"
          showText
          className="min-h-[200px]"
        />
      ) : selectedGameSlugs.size === 0 && slugOrder.length > 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Nenhum jogo selecionado no filtro. Marque pelo menos um jogo ou use
          &quot;Marcar todos&quot;.
        </p>
      ) : displayedAchievements.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {filterSessionOnly && sessionNewIds.size > 0
            ? "Nenhuma conquista nova nesta sessão com os filtros atuais."
            : "Nenhuma conquista para os jogos e filtros selecionados."}
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {displayedAchievements.map((achievement) => (
            <AchievementCardItem
              key={achievement.id}
              achievement={achievement}
              sessionNewIds={sessionNewIds}
              showRecentBadge
              onOpen={() =>
                onAchievementClick(
                  toModalAchievement(achievement, sessionNewIds),
                )
              }
            />
          ))}
        </motion.div>
      )}

      <Dialog
        open={syncDialogOpen}
        onOpenChange={(open) => {
          if (syncBusy) return;
          setSyncDialogOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            if (syncBusy) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (syncBusy) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {syncBusy
                ? "Sincronizando conquistas"
                : "Qual jogo você quer atualizar as conquistas?"}
            </DialogTitle>
            <DialogDescription>
              {syncBusy
                ? "Buscando os dados mais recentes e verificando desbloqueios. Pode levar alguns segundos (por exemplo, ao sincronizar com a Steam)."
                : "Selecione o jogo ou a plataforma que deseja sincronizar. Ao terminar, você recebe um aviso se tiver conquistado algo novo."}
            </DialogDescription>
          </DialogHeader>

          {syncBusy ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
              <Loader2
                className="h-9 w-9 animate-spin text-primary"
                aria-hidden
              />
              <p className="text-sm font-medium text-center text-foreground">
                Atualizando conquistas…
              </p>
            </div>
          ) : (
            <>
              <RadioGroup
                value={pickSlug}
                onValueChange={setPickSlug}
                className="gap-3 py-2"
              >
                {slugOrder.map((slug) => {
                  const label = SLUG_LABELS[slug] ?? slug;
                  const rid = `sync-game-${slug}`;
                  return (
                    <div key={slug} className="flex items-center space-x-3">
                      <RadioGroupItem value={slug} id={rid} />
                      <Label
                        htmlFor={rid}
                        className="font-normal cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSyncDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSync}
                  disabled={!pickSlug}
                >
                  Atualizar este jogo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AchievementCardItem({
  achievement,
  sessionNewIds,
  showRecentBadge,
  onOpen,
}: {
  achievement: ProfileAchievementApi;
  sessionNewIds: Set<number>;
  showRecentBadge: boolean;
  onOpen: () => void;
}) {
  const recentlyUnlocked =
    showRecentBadge &&
    achievement.unlocked &&
    sessionNewIds.has(achievement.id);

  const iconNode = achievement.icon_image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={achievement.icon_image_url}
      alt=""
      className="h-7 w-7 object-contain"
    />
  ) : (
    <span className="text-xl">{achievement.icon || "🏆"}</span>
  );

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      }}
      className={cn(!achievement.unlocked && "opacity-[0.72]")}
    >
      <ConquistText
        title={achievement.title}
        text={achievement.description}
        date={achievement.unlocked && achievement.date ? achievement.date : "—"}
        Icon={iconNode}
        rarity={achievement.rarity}
        recentlyUnlocked={recentlyUnlocked}
        onCardClick={onOpen}
      />
    </motion.div>
  );
}
