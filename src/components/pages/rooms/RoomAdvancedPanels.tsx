"use client";

import {
  fetchRoomMemberStats,
  fetchRoomRankings,
  type RoomRankingBoard,
  type RoomRankingPeriod,
} from "@/actions/roomRankingsActions";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import type { RoomMemberStatRow, RoomRankingRow } from "@/types/RoomRankings";
import {
  Award,
  BarChart3,
  Clock,
  Flame,
  Gamepad2,
  MessageSquare,
  Trophy,
  TvMinimalPlay,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  extractYoutubeVideoId,
  fetchYoutubeOEmbedTitle,
} from "@/lib/youtube";
import { RoomModerationSanctionsPanel } from "./RoomModerationSanctionsPanel";
import { patchChatRoomSettings } from "@/actions/chatRoomMutations";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { ChatRoom } from "@/types/ChatRoom";
import {
  Disc3,
  Music,
  Pencil,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";

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
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-2 shadow-sm">
      <h3 className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {title}
      </h3>
      {subtitle ? (
        <p className="mb-2 text-[10px] text-muted-foreground">{subtitle}</p>
      ) : null}
      <div className="space-y-1">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div
              key={row.user_id}
              className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/40 px-2 py-1.5"
            >
              <span className="w-4 text-center text-xs font-bold text-muted-foreground">
                {row.rank}
              </span>
              <ProfileAvatar
                displayName={row.fullname}
                username={row.username}
                profilePhoto={row.profile_photo}
                sizeClass="h-6 w-6"
                fallbackTextClassName="text-[9px]"
              />
              <span className="flex-1 truncate text-xs font-medium text-foreground">
                {row.fullname}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {formatBoardValue(board, row.value, period)}
              </span>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">Sem dados no período.</p>
        )}
      </div>
    </div>
  );
}

function StatInfoRow({ row, showEngagement }: { row: RoomMemberStatRow; showEngagement: boolean }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/30 px-3 py-2">
      <div className="flex items-center gap-2">
        <ProfileAvatar
          displayName={row.fullname}
          username={row.username}
          profilePhoto={row.profile_photo}
          sizeClass="h-7 w-7"
          fallbackTextClassName="text-[10px]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{row.fullname}</p>
          <p className="text-[10px] text-muted-foreground">@{row.username}</p>
        </div>
        {showEngagement && row.participation_score != null ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {row.participation_score}% engajamento
          </span>
        ) : null}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-muted-foreground sm:grid-cols-3">
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
  const [error, setError] = useState<string | null>(null);
  const [pointsRows, setPointsRows] = useState<RoomRankingRow[]>([]);
  const [winsRows, setWinsRows] = useState<RoomRankingRow[]>([]);
  const [streakRows, setStreakRows] = useState<RoomRankingRow[]>([]);
  const [participationRows, setParticipationRows] = useState<RoomRankingRow[]>([]);
  const [streakLabel, setStreakLabel] = useState("");
  const [participationLabel, setParticipationLabel] = useState("");
  const [myRanks, setMyRanks] = useState<Partial<Record<RoomRankingBoard, { rank: number | null; value: number }>>>({});
  const [memberStats, setMemberStats] = useState<RoomMemberStatRow[]>([]);
  const [canViewEngagement, setCanViewEngagement] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [pointsRes, winsRes, streakRes, participationRes, statsRes] = await Promise.all([
      fetchRoomRankings(roomSlug, period, "points"),
      fetchRoomRankings(roomSlug, period, "wins"),
      fetchRoomRankings(roomSlug, period, "streak"),
      fetchRoomRankings(roomSlug, period, "participation"),
      fetchRoomMemberStats(roomSlug),
    ]);

    if (!pointsRes.ok || !winsRes.ok || !streakRes.ok || !participationRes.ok) {
      const err = !pointsRes.ok
        ? pointsRes.error
        : !winsRes.ok
          ? winsRes.error
          : !streakRes.ok
            ? streakRes.error
            : participationRes.error;
      setError(err ?? "Falha ao carregar rankings.");
      setLoading(false);
      return;
    }

    setPointsRows(pointsRes.data.rows);
    setWinsRows(winsRes.data.rows);
    setStreakRows(streakRes.data.rows);
    setParticipationRows(participationRes.data.rows);
    setStreakLabel(streakRes.data.streak_label);
    setParticipationLabel(participationRes.data.streak_label);
    setMyRanks({
      points: pointsRes.data.my_rank ?? undefined,
      wins: winsRes.data.my_rank ?? undefined,
      streak: streakRes.data.my_rank ?? undefined,
      participation: participationRes.data.my_rank ?? undefined,
    });

    if (statsRes.ok) {
      setMemberStats(statsRes.data.rows);
      setCanViewEngagement(statsRes.data.can_view_engagement);
    }
    setLoading(false);
  }, [roomSlug, period]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      title: "Top Vitórias",
      icon: Trophy,
      rows: winsRows,
      board: "wins" as const,
    },
    {
      title: period === "all" ? "Top Sequência" : "Dias Ativos",
      icon: Flame,
      rows: streakRows,
      board: "streak" as const,
      subtitle: streakLabel,
    },
    {
      title: "Top Participação",
      icon: BarChart3,
      rows: participationRows,
      board: "participation" as const,
      subtitle: participationLabel,
    },
  ];

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Trophy className="h-5 w-5 text-neon-gold" />
          Rankings — {roomName}
        </h2>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPeriod(opt.id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                period === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Top diário (3), semanal e mensal (5) em cada categoria ganham bônus de pontos que entram no
        ranking de pontuação. Temporada geral é apenas informativa — sem bônus extra.
      </p>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Carregando rankings…</p>
      ) : (
        <>
          {Object.entries(myRanks).some(([, v]) => v && v.value > 0) ? (
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {boards.map((board) => (
              <RankingBoardCard
                key={board.board}
                title={board.title}
                icon={board.icon}
                rows={board.rows}
                board={board.board}
                period={period}
                subtitle={board.subtitle}
              />
            ))}
          </div>
        </>
      )}

      <section className="space-y-2 border-t border-border/40 pt-4">
        <h3 className="text-sm font-bold text-foreground">Estatísticas da sala</h3>
        {canViewEngagement ? (
          <p className="text-[11px] text-primary">
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
    const videoId = extractYoutubeVideoId(raw);
    if (!videoId) {
      setLocalError(
        "Cole apenas links HTTPS do YouTube (watch, youtu.be, embed ou shorts). Caminhos locais não são aceitos.",
      );
      return;
    }
    setLocalError(null);
    setBusy(true);
    try {
      const title = await fetchYoutubeOEmbedTitle(videoId);
      sendRoomMusic({ action: "add", video_id: videoId, title });
      setUrl("");
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
    <div className="h-full space-y-5 overflow-y-auto bg-muted/20 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Music className="h-5 w-5 text-neon-pink" />
        Música - {roomName}
      </h2>

      <p className="text-xs text-muted-foreground">
        Fila compartilhada: apenas links do YouTube. Use o player fixo no rodapé da sala (visível em
        todas as abas) para pausar, volume e trocar de faixa para todos.
      </p>

      {!canQueue && !canPlayback ? (
        <p className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
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
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={busy || !canQueue}
            className="flex-1 rounded-lg border border-border/60 bg-muted/70 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void addMusic()}
            disabled={busy || !canQueue}
            className="rounded-lg gradient-primary p-2 text-primary-foreground disabled:opacity-50"
            title="Adicionar à fila"
          >
            <Plus className="h-4 w-4" />
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
                    <p className="truncate text-[10px] text-muted-foreground">{item.video_id}</p>
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
            Nenhuma música na fila. Adicione um link do YouTube acima.
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
    <div className="h-full space-y-5 overflow-y-auto bg-muted/20 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Settings className="h-5 w-5 text-muted-foreground" />
        Configurações da Sala
      </h2>

      {!canSettings && !canSlug ? (
        <p className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
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
