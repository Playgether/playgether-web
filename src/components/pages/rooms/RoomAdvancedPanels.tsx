"use client";

import {
  fetchAllRoomRankingsPanelData,
  type RoomRankingBoard,
  type RoomRankingPeriod,
} from "@/actions/roomRankingsActions";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import {
  RANKINGS_REFRESH_COOLDOWN_MS,
  readRoomRankingsCache,
  writeRoomRankingsCache,
} from "@/lib/roomRankingsCache";
import type { RoomMemberStatRow, RoomRankingRow } from "@/types/RoomRankings";
import {
  Award,
  BarChart3,
  Clock,
  Disc3,
  Flame,
  Gamepad2,
  MessageSquare,
  Music,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  Trophy,
  TvMinimalPlay,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { RoomModerationSanctionsPanel } from "./RoomModerationSanctionsPanel";
import { patchChatRoomSettings } from "@/actions/chatRoomMutations";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { ChatRoom } from "@/types/ChatRoom";
import { MediaResolveError, resolveMediaTrack } from "@/lib/mediaResolver";
import { isSupportedMediaUrl } from "@/lib/mediaUrls";

interface RoomRankingsPanelProps {
  roomSlug: string;
  roomName: string;
}

const PERIOD_OPTIONS: { id: RoomRankingPeriod; label: string }[] = [
  { id: "daily", label: "Diário" },
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensal" },
  { id: "all", label: "Geral" },
];

const GAME_WIN_BOARDS: { eventType: string; title: string; subtitle: string }[] = [
  {
    eventType: "vote_best",
    title: "Top Vote no Melhor",
    subtitle: "Vitórias em eventos Vote no Melhor no período selecionado.",
  },
  {
    eventType: "button_quiz",
    title: "Top Button Quiz",
    subtitle: "Vitórias em eventos Button Quiz no período selecionado.",
  },
];

function boardSubtitle(
  board: RoomRankingBoard,
  period: RoomRankingPeriod,
  title: string,
  customSubtitle?: string,
): string {
  if (customSubtitle) return customSubtitle;
  switch (board) {
    case "points":
      return "Pontos de eventos e bônus de temporada no período selecionado.";
    case "wins":
      return "Vitórias em qualquer jogo da sala no período selecionado.";
    case "streak":
      return period === "all"
        ? "Sequência atual de dias seguidos com presença na sala."
        : "Dias com presença qualificada no período selecionado.";
    case "participation":
      return "Engajamento na sala: jogos, presença, mensagens e transmissões.";
    default:
      return title;
  }
}

function rankMedalClass(rank: number) {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-700";
  return "text-muted-foreground";
}

function formatBoardValue(board: RoomRankingBoard, value: number, period: RoomRankingPeriod) {
  if (board === "points") return `${value} pts`;
  if (board === "wins") return `${value} vitória${value === 1 ? "" : "s"}`;
  if (board === "participation") return `${value}%`;
  if (period === "all") return `${value}d seguidos`;
  return `${value} dia${value === 1 ? "" : "s"}`;
}

function RankingBoardCard({
  title,
  icon: Icon,
  rows,
  board,
  period,
  subtitle,
}: {
  title: string;
  icon: typeof Award;
  rows: RoomRankingRow[];
  board: RoomRankingBoard;
  period: RoomRankingPeriod;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-[240px] flex-col rounded-xl border border-border/60 bg-card/50 p-3 shadow-sm">
      <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
      <div className="flex min-h-[140px] flex-1 flex-col">
        {rows.length > 0 ? (
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div
                key={row.user_id}
                className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/60 px-2.5 py-2"
              >
                <span
                  className={`w-5 text-center text-sm font-bold tabular-nums ${rankMedalClass(row.rank)}`}
                >
                  {row.rank}
                </span>
                <ProfileAvatar
                  displayName={row.fullname}
                  username={row.username}
                  profilePhoto={row.profile_photo}
                  sizeClass="h-8 w-8"
                  fallbackTextClassName="text-[10px]"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {row.fullname}
                </span>
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {formatBoardValue(board, row.value, period)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">Sem dados no período.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RankingsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border/60 bg-card/50 p-3">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          {Array.from({ length: 4 }).map((__, j) => (
            <div key={j} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function StatInfoRow({ row, showEngagement }: { row: RoomMemberStatRow; showEngagement: boolean }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/30 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <ProfileAvatar
          displayName={row.fullname}
          username={row.username}
          profilePhoto={row.profile_photo}
          sizeClass="h-9 w-9"
          fallbackTextClassName="text-[11px]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{row.fullname}</p>
          <p className="text-xs text-muted-foreground">@{row.username}</p>
        </div>
        {showEngagement && row.participation_score != null ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {row.participation_score}% engajamento
          </span>
        ) : null}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground sm:grid-cols-3">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {row.message_count} msgs
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {row.hours_in_room}h na sala
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-3 w-3" />
          {row.days_visited} dias
        </span>
        <span className="flex items-center gap-1">
          <Gamepad2 className="h-3 w-3" />
          {row.events_participated} jogos
        </span>
        <span className="flex items-center gap-1">
          <TvMinimalPlay className="h-3 w-3" />
          {row.transmissions_participated} transmissões
        </span>
        {showEngagement && row.distinct_message_hours != null ? (
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {row.distinct_message_hours} horários distintos
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function RoomRankingsPanel({ roomSlug, roomName }: RoomRankingsPanelProps) {
  const [period, setPeriod] = useState<RoomRankingPeriod>("weekly");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState(0);
  const [pointsRows, setPointsRows] = useState<RoomRankingRow[]>([]);
  const [winsRows, setWinsRows] = useState<RoomRankingRow[]>([]);
  const [streakRows, setStreakRows] = useState<RoomRankingRow[]>([]);
  const [participationRows, setParticipationRows] = useState<RoomRankingRow[]>([]);
  const [gameWinRows, setGameWinRows] = useState<Record<string, RoomRankingRow[]>>({});
  const [myRanks, setMyRanks] = useState<Partial<Record<RoomRankingBoard, { rank: number | null; value: number }>>>({});
  const [memberStats, setMemberStats] = useState<RoomMemberStatRow[]>([]);
  const [canViewEngagement, setCanViewEngagement] = useState(false);

  const applyPanelData = useCallback(
    (data: {
      pointsRows: RoomRankingRow[];
      winsRows: RoomRankingRow[];
      streakRows: RoomRankingRow[];
      participationRows: RoomRankingRow[];
      gameWinRows: Record<string, RoomRankingRow[]>;
      myRanks: Partial<Record<RoomRankingBoard, { rank: number | null; value: number }>>;
      memberStats: RoomMemberStatRow[];
      canViewEngagement: boolean;
    }) => {
      setPointsRows(data.pointsRows);
      setWinsRows(data.winsRows);
      setStreakRows(data.streakRows);
      setParticipationRows(data.participationRows);
      setGameWinRows(data.gameWinRows);
      setMyRanks(data.myRanks);
      setMemberStats(data.memberStats);
      setCanViewEngagement(data.canViewEngagement);
    },
    [],
  );

  const persistCache = useCallback(
    (data: Parameters<typeof applyPanelData>[0]) => {
      writeRoomRankingsCache(roomSlug, period, {
        pointsRows: data.pointsRows,
        winsRows: data.winsRows,
        streakRows: data.streakRows,
        participationRows: data.participationRows,
        gameWinRows: data.gameWinRows,
        myRanks: data.myRanks,
        memberStats: data.memberStats,
        canViewEngagement: data.canViewEngagement,
      });
      setLastFetchedAt(Date.now());
    },
    [roomSlug, period],
  );

  const cooldownRef = useRef(0);
  useEffect(() => {
    cooldownRef.current = cooldownRemainingSec;
  }, [cooldownRemainingSec]);

  const loadData = useCallback(
    async (options?: { refresh?: boolean; silent?: boolean }) => {
      const isRefresh = options?.refresh === true;
      const silent = options?.silent === true;

      if (isRefresh) {
        if (cooldownRef.current > 0) return;
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }
      setError(null);

      const res = await fetchAllRoomRankingsPanelData(roomSlug, period, isRefresh);

      if (!res.ok) {
        if ("throttled" in res && res.throttled) {
          const retrySec = res.retryAfterSec ?? Math.ceil(RANKINGS_REFRESH_COOLDOWN_MS / 1000);
          setCooldownRemainingSec(retrySec);
          setError(res.error);
        } else {
          setError(res.error ?? "Falha ao carregar rankings.");
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      applyPanelData(res.data);
      persistCache(res.data);
      if (isRefresh) {
        setCooldownRemainingSec(Math.ceil(RANKINGS_REFRESH_COOLDOWN_MS / 1000));
      }
      setLoading(false);
      setRefreshing(false);
    },
    [applyPanelData, period, persistCache, roomSlug],
  );

  useEffect(() => {
    const cached = readRoomRankingsCache(roomSlug, period);
    if (cached) {
      applyPanelData(cached);
      setLastFetchedAt(cached.fetchedAt);
      setLoading(false);
      return;
    }
    void loadData();
  }, [roomSlug, period, applyPanelData, loadData]);

  useEffect(() => {
    if (cooldownRemainingSec <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownRemainingSec((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownRemainingSec]);

  const refreshDisabled = refreshing || loading || cooldownRemainingSec > 0;

  const sortedStats = useMemo(
    () => [...memberStats].sort((a, b) => a.fullname.localeCompare(b.fullname, "pt-BR")),
    [memberStats],
  );

  const boards = [
    {
      title: "Top Pontuação",
      icon: Award,
      rows: pointsRows,
      board: "points" as const,
    },
    {
      title: "Top Vitórias (todos os jogos)",
      icon: Trophy,
      rows: winsRows,
      board: "wins" as const,
    },
    ...GAME_WIN_BOARDS.map((game) => ({
      title: game.title,
      icon: Gamepad2,
      rows: gameWinRows[game.eventType] ?? [],
      board: "wins" as const,
      customSubtitle: game.subtitle,
    })),
    {
      title: period === "all" ? "Top Sequência" : "Dias Ativos",
      icon: Flame,
      rows: streakRows,
      board: "streak" as const,
    },
    {
      title: "Top Participação",
      icon: BarChart3,
      rows: participationRows,
      board: "participation" as const,
    },
  ];

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Trophy className="h-5 w-5 text-neon-gold" />
          Rankings — {roomName}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-border/60 bg-muted/40 p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  period === opt.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void loadData({ refresh: true })}
            disabled={refreshDisabled}
            title={
              cooldownRemainingSec > 0
                ? `Aguarde ${cooldownRemainingSec}s para atualizar novamente`
                : "Buscar dados atualizados"
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {cooldownRemainingSec > 0
              ? `Aguarde ${cooldownRemainingSec}s`
              : refreshing
                ? "Atualizando…"
                : "Atualizar"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Top diário (3), semanal e mensal (5) em cada categoria ganham bônus de pontos que entram no
          ranking de pontuação. Temporada geral é apenas informativa — sem bônus extra.
        </p>
        {lastFetchedAt ? (
          <p className="shrink-0 text-xs text-muted-foreground">
            Dados de{" "}
            {new Date(lastFetchedAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <RankingsLoadingSkeleton />
      ) : (
        <>
          {Object.entries(myRanks).some(([, v]) => v && v.value > 0) ? (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {myRanks.points && myRanks.points.value > 0 ? (
                <span className="rounded-full border border-border/50 bg-card/40 px-2 py-0.5">
                  Você: #{myRanks.points.rank ?? "—"} em pontos ({myRanks.points.value} pts)
                </span>
              ) : null}
              {myRanks.wins && myRanks.wins.value > 0 ? (
                <span className="rounded-full border border-border/50 bg-card/40 px-2 py-0.5">
                  Você: #{myRanks.wins.rank ?? "—"} em vitórias
                </span>
              ) : null}
              {myRanks.streak && myRanks.streak.value > 0 ? (
                <span className="rounded-full border border-border/50 bg-card/40 px-2 py-0.5">
                  Você: #{myRanks.streak.rank ?? "—"} em{" "}
                  {period === "all" ? "sequência" : "dias ativos"}
                </span>
              ) : null}
              {myRanks.participation && myRanks.participation.value > 0 ? (
                <span className="rounded-full border border-border/50 bg-card/40 px-2 py-0.5">
                  Você: #{myRanks.participation.rank ?? "—"} em participação (
                  {myRanks.participation.value}%)
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {boards.map((board) => (
              <RankingBoardCard
                key={`${board.board}-${board.title}`}
                title={board.title}
                icon={board.icon}
                rows={board.rows}
                board={board.board}
                period={period}
                subtitle={boardSubtitle(
                  board.board,
                  period,
                  board.title,
                  "customSubtitle" in board ? board.customSubtitle : undefined,
                )}
              />
            ))}
          </div>
        </>
      )}

      <section className="space-y-3 border-t border-border/40 pt-5">
        <h3 className="text-base font-bold text-foreground">Estatísticas da sala</h3>
        {canViewEngagement ? (
          <p className="text-sm text-primary">
            Como moderador/dono, você também vê o score de engajamento interno.
          </p>
        ) : null}
        <div className="space-y-2">
          {sortedStats.length > 0 ? (
            sortedStats.map((row) => (
              <StatInfoRow key={row.user_id} row={row} showEngagement={canViewEngagement} />
            ))
          ) : (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Ainda não há estatísticas registradas nesta sala.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

interface RoomMusicPanelProps {
  roomName: string;
}

export function RoomMusicPanel({ roomName }: RoomMusicPanelProps) {
  const { can } = useRoomPermissions();
  const canQueue = can("music.queue.manage");
  const canPlayback = canQueue || can("music.playback.control");
  const {
    roomMusic,
    sendRoomMusic,
    roomMusicError,
    clearRoomMusicError,
  } = useChatHandlerContext();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const addMusic = async () => {
    if (!canQueue) return;
    clearRoomMusicError();
    const raw = url.trim();
    if (!raw) return;

    if (!isSupportedMediaUrl(raw)) {
      setLocalError(
        "Cole um link do YouTube, Spotify ou Deezer (HTTPS). Caminhos locais não são aceitos.",
      );
      return;
    }

    setLocalError(null);
    setBusy(true);
    try {
      const track = await resolveMediaTrack(raw);
      sendRoomMusic({ action: "add", track });
      setUrl("");
    } catch (err) {
      if (err instanceof MediaResolveError) {
        setLocalError(err.message);
      } else {
        setLocalError("Não foi possível adicionar a música. Tente novamente.");
      }
    } finally {
      setBusy(false);
    }
  };

  const removeMusic = (index: number) => {
    if (!canQueue) return;
    sendRoomMusic({ action: "remove", index });
  };

  const selectTrack = (index: number) => {
    if (!canPlayback) return;
    sendRoomMusic({ action: "select", index });
  };

  const bannerError = localError || roomMusicError;

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/50 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Music className="h-5 w-5 text-neon-pink" />
        Música - {roomName}
      </h2>

      <p className="text-xs text-muted-foreground">
        Fila compartilhada: cole um link do YouTube, Spotify ou Deezer. O sistema resolve
        automaticamente nos outros providers e escolhe o melhor embed disponível.
      </p>

      {!canQueue && !canPlayback ? (
        <p className="rounded-lg border border-border/50 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Você não tem permissão para gerenciar a música desta sala.
        </p>
      ) : null}

      {bannerError ? (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <span>{bannerError}</span>
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              clearRoomMusicError();
            }}
            className="shrink-0 rounded p-0.5 hover:bg-destructive/20"
            aria-label="Fechar aviso"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(event) => {
              setLocalError(null);
              setUrl(event.target.value);
            }}
            onKeyDown={(event) => event.key === "Enter" && !busy && void addMusic()}
            placeholder="Link do YouTube, Spotify ou Deezer…"
            disabled={busy || !canQueue}
            aria-label="Link de música"
            className="flex-1 rounded-lg border border-border/60 bg-muted/70 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void addMusic()}
            disabled={busy || !canQueue}
            className="rounded-lg gradient-primary p-2 text-primary-foreground disabled:opacity-50"
            title={busy ? "Resolvendo…" : "Adicionar à fila"}
          >
            <Plus className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {roomMusic.queue.length > 0 ? (
          roomMusic.queue.map((item, index) => {
            const active = index === roomMusic.current_index;
            return (
              <div
                key={`${item.video_id}-${index}`}
                className={`group flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  active
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/60 bg-muted/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectTrack(index)}
                  disabled={!canPlayback}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-50"
                  title="Tocar esta faixa na sala"
                >
                  <Disc3
                    className={`mt-0.5 h-5 w-5 shrink-0 ${active ? "text-primary" : "text-neon-blue"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    {item.artist ? (
                      <p className="truncate text-[10px] text-muted-foreground">{item.artist}</p>
                    ) : (
                      <p className="truncate text-[10px] text-muted-foreground">{item.video_id}</p>
                    )}
                    {item.active_provider && item.active_provider !== "youtube" && (
                      <p className="mt-0.5 truncate text-[9px] font-medium text-amber-500/90">
                        via{" "}
                        {item.active_provider === "spotify" ? "Spotify" : "Deezer"}
                        {" "}(embed)
                      </p>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => removeMusic(index)}
                  disabled={!canQueue}
                  className="rounded-md p-1.5 text-muted-foreground opacity-80 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-30"
                  title="Remover da fila"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma música na fila. Cole um link do YouTube acima.
          </p>
        )}
      </div>
    </div>
  );
}

interface RoomSettingsPanelProps {
  room: ChatRoom;
}

export function RoomSettingsPanel({ room }: RoomSettingsPanelProps) {
  const { can } = useRoomPermissions();
  const canSettings = can("room.settings.manage");
  const canSlug = can("room.settings.slug");
  const canModerate = can("members.kick") || can("members.mute");
  const [editing, setEditing] = useState<"name" | "summary" | "slug" | null>(null);
  const [localName, setLocalName] = useState(room.group_name);
  const [localSummary, setLocalSummary] = useState(room.summary);
  const [localSlug, setLocalSlug] = useState(room.slug);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const startEdit = (key: "name" | "summary" | "slug") => {
    if (key === "slug" && !canSlug) return;
    if (key !== "slug" && !canSettings) return;
    setError(null);
    setEditing(key);
    if (key === "name") setDraft(localName);
    else if (key === "summary") setDraft(localSummary);
    else setDraft(localSlug);
  };

  const saveEdit = () => {
    if (!editing || !draft.trim()) return;
    if (editing === "slug" && !canSlug) return;
    if (editing !== "slug" && !canSettings) return;
    const key = editing;
    const value = draft.trim();
    setError(null);
    startTransition(async () => {
      const payload =
        key === "name"
          ? { group_name: value }
          : key === "slug"
            ? { slug: value }
            : { summary: value };
      const res = await patchChatRoomSettings(room.slug, payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (key === "name") setLocalName(value);
      else if (key === "slug") {
        setLocalSlug(res.data.slug);
        window.location.href = `/rooms/${res.data.slug}`;
        return;
      } else setLocalSummary(value);
      setEditing(null);
    });
  };

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/50 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Settings className="h-5 w-5 text-muted-foreground" />
        Configurações da Sala
      </h2>

      {!canSettings && !canSlug ? (
        <p className="rounded-lg border border-border/50 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Você não tem permissão para alterar as configurações desta sala.
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}

      <div className="space-y-3">
        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nome
            </span>
            {editing !== "name" ? (
              <button
                type="button"
                onClick={() => startEdit("name")}
                disabled={!canSettings || isPending}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Pencil className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          {editing === "name" ? (
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={isPending}
                className="flex-1 rounded border border-border/60 bg-muted/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={saveEdit}
                disabled={isPending}
                className="rounded p-1 text-neon-green hover:bg-muted disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={isPending}
                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-foreground hyphens-none whitespace-normal">
              {localName}
            </span>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descrição
            </span>
            {editing !== "summary" ? (
              <button
                type="button"
                onClick={() => startEdit("summary")}
                disabled={!canSettings || isPending}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Pencil className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          {editing === "summary" ? (
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                disabled={isPending}
                className="flex-1 resize-none rounded border border-border/60 bg-muted/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isPending}
                  className="rounded p-1 text-neon-green hover:bg-muted disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={isPending}
                  className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <span className="text-sm text-foreground">{localSummary}</span>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Endereço da sala (URL)
            </span>
            {editing !== "slug" ? (
              <button
                type="button"
                onClick={() => startEdit("slug")}
                disabled={!canSlug || isPending}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Pencil className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          {editing === "slug" ? (
            <div className="space-y-2">
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Links antigos deixam de funcionar. O endereço deve ser único.
              </p>
              <div className="flex gap-2">
                <span className="shrink-0 pt-2 text-xs text-muted-foreground">/rooms/</span>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  disabled={isPending}
                  className="flex-1 rounded border border-border/60 bg-muted/60 px-2 py-1 text-sm"
                />
                <button type="button" onClick={saveEdit} disabled={isPending}>
                  <Save className="h-3.5 w-3.5 text-neon-green" />
                </button>
                <button type="button" onClick={() => setEditing(null)} disabled={isPending}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <span className="font-mono text-sm text-foreground">/rooms/{localSlug}</span>
          )}
        </div>

        {canModerate ? (
          <RoomModerationSanctionsPanel roomSlug={room.slug} />
        ) : null}
      </div>
    </div>
  );
}
