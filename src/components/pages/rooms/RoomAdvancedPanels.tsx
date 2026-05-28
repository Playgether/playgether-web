"use client";

import { patchChatRoomSettings } from "@/actions/chatRoomMutations";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { ChatRoom } from "@/types/ChatRoom";
import {
  Award,
  Disc3,
  Flame,
  MessageSquare,
  Music,
  Pencil,
  Plus,
  Save,
  Settings,
  Trash2,
  Trophy,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import {
  extractYoutubeVideoId,
  fetchYoutubeOEmbedTitle,
} from "@/lib/youtube";
import { RoomModerationSanctionsPanel } from "./RoomModerationSanctionsPanel";

interface RoomRankingsPanelProps {
  roomName: string;
}

export function RoomRankingsPanel({ roomName }: RoomRankingsPanelProps) {
  const { onlineUsers } = useChatHandlerContext();
  const rankingRows = useMemo(
    () =>
      onlineUsers.map((user, index) => ({
        ...user,
        score: Math.max(100, 2200 - index * 133),
        messages: Math.max(10, 540 - index * 27),
        streak: Math.max(1, 21 - index),
      })),
    [onlineUsers]
  );

  const topByScore = [...rankingRows].sort((a, b) => b.score - a.score).slice(0, 5);
  const topByMessages = [...rankingRows]
    .sort((a, b) => b.messages - a.messages)
    .slice(0, 5);
  const topByStreak = [...rankingRows].sort((a, b) => b.streak - a.streak).slice(0, 5);

  const boards = [
    {
      title: "Top Pontuação",
      icon: Award,
      rows: topByScore,
      value: (row: (typeof topByScore)[number]) => `${row.score} pts`,
    },
    {
      title: "Top Mensagens",
      icon: MessageSquare,
      rows: topByMessages,
      value: (row: (typeof topByMessages)[number]) => `${row.messages}`,
    },
    {
      title: "Top Sequência",
      icon: Flame,
      rows: topByStreak,
      value: (row: (typeof topByStreak)[number]) => `${row.streak}d`,
    },
  ];

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/20 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Trophy className="h-5 w-5 text-neon-gold" />
        Rankings - {roomName}
      </h2>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board.title}
            className="rounded-xl border border-border/60 bg-muted/30 p-2 shadow-sm"
          >
            <h3 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <board.icon className="h-3 w-3" />
              {board.title}
            </h3>
            <div className="space-y-1">
              {board.rows.length > 0 ? (
                board.rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/40 px-2 py-1.5"
                  >
                    <span className="w-4 text-center text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <img
                      src={row.profile_photo}
                      alt={row.fullname}
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
                    />
                    <span className="flex-1 truncate text-xs font-medium text-foreground">
                      {row.fullname}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {board.value(row)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Sem dados no momento.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
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
