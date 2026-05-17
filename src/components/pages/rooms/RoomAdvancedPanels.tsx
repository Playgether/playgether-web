"use client";

import { patchChatRoomSettings } from "@/actions/chatRoomMutations";
import { useAuthContext } from "@/context/AuthContext";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
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
  Shield,
  Trash2,
  Trophy,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { isSafeYoutubeHttpUrl } from "@/lib/youtube";
import { MediaResolveError, resolveMediaTrack } from "@/lib/mediaResolver";

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

interface RoomRolesPanelProps {
  roomName: string;
}

type LocalRole = {
  id: string;
  name: string;
};

const initialRoles: LocalRole[] = [
  { id: "admin", name: "ADM" },
  { id: "mod", name: "MOD" },
  { id: "vip", name: "VIP" },
];

export function RoomRolesPanel({ roomName }: RoomRolesPanelProps) {
  const { onlineUsers } = useChatHandlerContext();
  const [roles, setRoles] = useState<LocalRole[]>(initialRoles);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<number, string[]>>({});

  const addRole = () => {
    const normalized = newRoleName.trim();
    if (!normalized) return;
    const roleId = normalized.toLowerCase().replace(/\s+/g, "-");
    if (roles.some((role) => role.id === roleId)) return;
    setRoles((current) => [...current, { id: roleId, name: normalized }]);
    setNewRoleName("");
  };

  const deleteRole = (roleId: string) => {
    setRoles((current) => current.filter((role) => role.id !== roleId));
    setAssigned((current) => {
      const next = { ...current };
      Object.keys(next).forEach((userId) => {
        next[Number(userId)] = (next[Number(userId)] || []).filter(
          (id) => id !== roleId
        );
      });
      return next;
    });
    if (selectedRoleId === roleId) setSelectedRoleId(null);
  };

  const toggleAssign = (userId: number, roleId: string) => {
    setAssigned((current) => {
      const userRoles = current[userId] || [];
      const hasRole = userRoles.includes(roleId);
      return {
        ...current,
        [userId]: hasRole
          ? userRoles.filter((id) => id !== roleId)
          : [...userRoles, roleId],
      };
    });
  };

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Shield className="h-5 w-5 text-neon-emerald" />
          Cargos - {roomName}
        </h2>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-3 flex gap-2">
          <input
            value={newRoleName}
            onChange={(event) => setNewRoleName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addRole()}
            placeholder="Novo cargo..."
            className="flex-1 rounded-lg border border-border/60 bg-muted/70 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={addRole}
            className="rounded-lg gradient-primary p-2 text-primary-foreground"
            title="Criar cargo"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2"
            >
              <span className="flex-1 text-sm font-semibold text-foreground">
                {role.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Atribuir"
              >
                <UserPlus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteRole(role.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedRole ? (
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">
            Atribuir cargo: {selectedRole.name}
          </h3>
          <div className="space-y-1.5">
            {onlineUsers.map((user) => {
              const hasRole = (assigned[user.id] || []).includes(selectedRole.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                >
                  <img
                    src={user.profile_photo}
                    alt={user.fullname}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-border/60"
                  />
                  <span className="flex-1 text-sm text-foreground">
                    {user.fullname}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAssign(user.id, selectedRole.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      hasRole
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-neon-green/10 text-neon-green hover:bg-neon-green/20"
                    }`}
                  >
                    {hasRole ? "Remover" : "Atribuir"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface RoomMusicPanelProps {
  roomName: string;
}

export function RoomMusicPanel({ roomName }: RoomMusicPanelProps) {
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
    clearRoomMusicError();
    const raw = url.trim();
    if (!raw) return;

    if (!isSafeYoutubeHttpUrl(raw)) {
      setLocalError(
        "Cole apenas links HTTPS do YouTube (watch, youtu.be, embed ou shorts). Caminhos locais não são aceitos.",
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
    sendRoomMusic({ action: "remove", index });
  };

  const selectTrack = (index: number) => {
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
        Fila compartilhada: cole um link do YouTube. O sistema busca equivalentes no Spotify e
        Deezer automaticamente como fallback para vídeos bloqueados.
      </p>

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
            disabled={busy}
            aria-label="Link do YouTube"
            className="flex-1 rounded-lg border border-border/60 bg-muted/70 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void addMusic()}
            disabled={busy}
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
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
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
                  className="rounded-md p-1.5 text-muted-foreground opacity-80 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
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
  const { user } = useAuthContext();
  const [editing, setEditing] = useState<"name" | "summary" | null>(null);
  const [localName, setLocalName] = useState(room.group_name);
  const [localSummary, setLocalSummary] = useState(room.summary);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canManage =
    user?.user_id != null && Number(user.user_id) === room.owner;

  const startEdit = (key: "name" | "summary") => {
    if (!canManage) return;
    setError(null);
    setEditing(key);
    setDraft(key === "name" ? localName : localSummary);
  };

  const saveEdit = () => {
    if (!editing || !draft.trim() || !canManage) return;
    const key = editing;
    const value = draft.trim();
    setError(null);
    startTransition(async () => {
      const payload =
        key === "name" ? { group_name: value } : { summary: value };
      const res = await patchChatRoomSettings(room.slug, payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (key === "name") {
        setLocalName(value);
        setEditing(null);
      } else {
        setLocalSummary(value);
        setEditing(null);
      }
    });
  };

  return (
    <div className="h-full space-y-5 overflow-y-auto bg-muted/20 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Settings className="h-5 w-5 text-muted-foreground" />
        Configurações da Sala
      </h2>

      {!canManage ? (
        <p className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Apenas o criador da sala pode alterar nome e descrição.
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
                disabled={!canManage || isPending}
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
                disabled={!canManage || isPending}
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
      </div>
    </div>
  );
}
