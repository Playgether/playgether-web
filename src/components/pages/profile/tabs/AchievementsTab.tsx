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

const ACHIEVEMENTS_PAGE_SIZE = 12;

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

function formatAchievementLastSync(iso: string | undefined): string {
  if (!iso?.trim()) return "Ainda não sincronizado";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** Data/hora de desbloqueio no fuso do dispositivo (ISO do backend em UTC). */
function formatAchievementUnlockedShown(
  a: ProfileAchievementApi,
  whenLocked: "tile" | "modal",
): string {
  if (!a.unlocked) {
    return whenLocked === "modal" ? "Não desbloqueada" : "—";
  }
  if (a.unlocked_at) {
    const d = new Date(a.unlocked_at);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(d);
    }
  }
  return a.date?.trim() ? a.date : "—";
}

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
    date: formatAchievementUnlockedShown(a, "modal"),
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
  const [listPage, setListPage] = useState(1);
  const [listMeta, setListMeta] = useState({
    count: 0,
    page: 1,
    page_size: ACHIEVEMENTS_PAGE_SIZE,
    total_pages: 1,
  });
  const [lastSyncBySlug, setLastSyncBySlug] = useState<Record<string, string>>(
    {},
  );

  const profileId = profile?.id;

  const slugsKey = useMemo(
    () => [...selectedGameSlugs].sort().join(","),
    [selectedGameSlugs],
  );

  useEffect(() => {
    setSessionNewIds(new Set());
    setFilterSessionOnly(false);
    setSelectedGameSlugs(new Set());
    setListPage(1);
    setListMeta({
      count: 0,
      page: 1,
      page_size: ACHIEVEMENTS_PAGE_SIZE,
      total_pages: 1,
    });
    setLastSyncBySlug({});
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
    setListPage(1);
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

  const fetchAchievementsPage = useCallback(
    async (page: number) => {
      if (!profileId) return;
      const slugs = slugsKey.split(",").filter(Boolean);
      if (slugs.length === 0) {
        setAchievements([]);
        setListMeta({
          count: 0,
          page: 1,
          page_size: ACHIEVEMENTS_PAGE_SIZE,
          total_pages: 1,
        });
        return;
      }
      setLoadingList(true);
      try {
        const data = await getProfileAchievements(profileId, {
          page,
          page_size: ACHIEVEMENTS_PAGE_SIZE,
          game_slugs: slugs,
        });
        setAchievements(data.achievements);
        setListMeta({
          count: data.count,
          page: data.page,
          page_size: data.page_size,
          total_pages: Math.max(1, data.total_pages || 1),
        });
        setListPage(data.page);
        if (data.achievement_last_sync_by_slug) {
          setLastSyncBySlug(data.achievement_last_sync_by_slug);
        }
      } catch {
        setAchievements([]);
        setListMeta({
          count: 0,
          page: 1,
          page_size: ACHIEVEMENTS_PAGE_SIZE,
          total_pages: 1,
        });
      } finally {
        setLoadingList(false);
      }
    },
    [profileId, slugsKey],
  );

  useEffect(() => {
    fetchAchievementsPage(listPage);
  }, [listPage, fetchAchievementsPage]);

  const slugOrder = useMemo(() => statsGames.map((g) => g.slug), [statsGames]);

  const openSyncDialog = () => {
    setPickSlug(slugOrder[0] ?? "");
    setSyncDialogOpen(true);
  };

  const handleConfirmSync = async () => {
    if (!profileId || !isOwner || !pickSlug || syncBusy) return;

    setSyncBusy(true);
    try {
      const result = await refreshProfileAchievements(profileId, pickSlug);

      const trulyNewIds = result.newly_unlocked_ids;

      if (trulyNewIds.length > 0) {
        setSessionNewIds((prev) => {
          const next = new Set(prev);
          for (const id of trulyNewIds) {
            next.add(id);
          }
          return next;
        });
      }

      await fetchAchievementsPage(1);

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
    return list;
  }, [achievements, filterSessionOnly, sessionNewIds]);

  const toggleGameFilter = (slug: string) => {
    setListPage(1);
    setSelectedGameSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAllGameFilters = () => {
    setListPage(1);
    setSelectedGameSlugs(new Set(slugOrder));
  };

  const clearGameFilters = () => {
    setListPage(1);
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
                depende do filtro da lista abaixo.
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

          <div className="rounded-lg border border-border bg-card/30 px-4 py-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">
              Última sincronização
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              As últimas atualizações de cada jogo
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-none p-0 m-0">
              {slugOrder.map((slug) => (
                <li key={slug}>
                  <span className="text-foreground/85">
                    {SLUG_LABELS[slug] ?? slug}
                  </span>
                  {": "}
                  {formatAchievementLastSync(lastSyncBySlug[slug])}
                </li>
              ))}
            </ul>
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
        <div className="space-y-4">
          {loadingList && displayedAchievements.length > 0 && (
            <div className="flex justify-center py-1" aria-live="polite">
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                aria-hidden
              />
            </div>
          )}
          <motion.div
            key={`${slugsKey}-${listPage}`}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04 } },
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

          {listMeta.count > 0 && listMeta.total_pages > 1 && (
            <div className="flex flex-col items-center gap-3 border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Página {listMeta.page} de {listMeta.total_pages} ·{" "}
                {listMeta.count} conquista
                {listMeta.count === 1 ? "" : "s"}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={listMeta.page <= 1 || loadingList}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                {listMeta.total_pages <= 9 ? (
                  Array.from(
                    { length: listMeta.total_pages },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <Button
                      key={n}
                      type="button"
                      variant={n === listMeta.page ? "default" : "outline"}
                      size="sm"
                      className="min-w-9 px-2"
                      disabled={loadingList}
                      onClick={() => setListPage(n)}
                    >
                      {n}
                    </Button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground tabular-nums px-2">
                    {listMeta.page} / {listMeta.total_pages}
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    listMeta.page >= listMeta.total_pages || loadingList
                  }
                  onClick={() =>
                    setListPage((p) => Math.min(listMeta.total_pages, p + 1))
                  }
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
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
        date={formatAchievementUnlockedShown(achievement, "tile")}
        Icon={iconNode}
        rarity={achievement.rarity}
        recentlyUnlocked={recentlyUnlocked}
        onCardClick={onOpen}
      />
    </motion.div>
  );
}
