"use client";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users } from "lucide-react";
import { apiFetch } from "@/services/apiFetch";
import { PresenceContext } from "@/context/PresenceContext";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { useAuthContext } from "@/context/AuthContext";
import { subscribeFriendsListInvalidate } from "@/lib/friendsListEvents";
import { FriendMessageButton } from "./FriendMessageButton";

type FriendApi = {
  id: number;
  user_id: string | number;
  username: string;
  name: string;
  profile_photo: string | null;
  presence: { status: string; last_seen: string | null };
};

const STATUS_LABEL: Record<string, string> = {
  online: "Online",
  away: "Ausente",
  dnd: "Não perturbe",
  offline: "Offline",
};

function getStatusLabel(status: string) {
  return STATUS_LABEL[status] ?? "Offline";
}

function isActive(status: string) {
  return status === "online" || status === "away" || status === "dnd";
}

function getFriendStatus(
  friend: FriendApi,
  presenceCtx: React.ContextType<typeof PresenceContext>,
): string {
  if (!presenceCtx?.isPresenceConnected) {
    return friend.presence?.status ?? "offline";
  }
  return presenceCtx.getPresence(friend.user_id).status;
}

interface FriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendsModal({ open, onOpenChange }: FriendsModalProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const presenceCtx = useContext(PresenceContext);

  const [friends, setFriends] = useState<FriendApi[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { soft?: boolean }) => {
    setError(null);
    if (!opts?.soft) setLoading(true);
    try {
      const res = await apiFetch("/api/profiles/friends", { credentials: "include" });
      if (!res.ok) { setFriends([]); return; }
      const data = (await res.json()) as FriendApi[];
      setFriends(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar seus amigos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !user?.user_id) return;
    void load();
  }, [open, user?.user_id, load]);

  useEffect(() => {
    return subscribeFriendsListInvalidate(() => void load({ soft: true }));
  }, [load]);

  const { online, offline } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = friends.filter((f) => {
      if (f.user_id === user?.user_id) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q);
    });
    const online = filtered
      .filter((f) => isActive(getFriendStatus(f, presenceCtx ?? null)))
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
    const offline = filtered
      .filter((f) => !isActive(getFriendStatus(f, presenceCtx ?? null)))
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
    return { online, offline };
  }, [friends, query, presenceCtx]);

  const handleNavigate = (username: string) => {
    router.push(`/profile/${username}`);
    onOpenChange(false);
  };

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl p-0 bg-background/95 backdrop-blur-xl border border-primary/20 gap-0 max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold mb-2">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Amigos
            </span>
            {!loading && friends.length > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground mt-4">
                {online.length} online · {friends.length} no total
              </span>
            )}
          </DialogTitle>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar amigo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50 focus:ring-2 focus:ring-primary/30"
              disabled={loading}
            />
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-4 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <LoadingComponent text="Carregando amigos..." showText className="text-muted-foreground" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive text-center py-8">{error}</p>
            ) : friends.length === 0 ? (
              <EmptyFriends />
            ) : online.length === 0 && offline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum amigo encontrado para &quot;{query}&quot;.
              </p>
            ) : (
              <>
                {online.length > 0 && (
                  <FriendSection
                    title={`Online — ${online.length}`}
                    friends={online}
                    presenceCtx={presenceCtx ?? null}
                    onNavigate={handleNavigate}
                    onMessageSuccess={handleClose}
                  />
                )}
                {offline.length > 0 && (
                  <FriendSection
                    title={`Offline — ${offline.length}`}
                    friends={offline}
                    presenceCtx={presenceCtx ?? null}
                    onNavigate={handleNavigate}
                    onMessageSuccess={handleClose}
                    muted
                  />
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FriendSection({
  title,
  friends,
  presenceCtx,
  onNavigate,
  onMessageSuccess,
  muted = false,
}: {
  title: string;
  friends: FriendApi[];
  presenceCtx: React.ContextType<typeof PresenceContext>;
  onNavigate: (username: string) => void;
  onMessageSuccess: () => void;
  muted?: boolean;
}) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${muted ? "text-muted-foreground/60" : "text-primary"}`}>
        {title}
      </p>
      <div className="space-y-1">
        {friends.map((friend) => {
          const status = getFriendStatus(friend, presenceCtx);
          return (
            <FriendRow
              key={friend.user_id}
              friend={friend}
              status={status}
              muted={muted}
              onNavigate={onNavigate}
              onMessageSuccess={onMessageSuccess}
            />
          );
        })}
      </div>
    </div>
  );
}

function FriendRow({
  friend,
  status,
  muted,
  onNavigate,
  onMessageSuccess,
}: {
  friend: FriendApi;
  status: string;
  muted: boolean;
  onNavigate: (username: string) => void;
  onMessageSuccess: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(friend.username)}
      onKeyDown={(e) => { if (e.key === "Enter") onNavigate(friend.username); }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group
        ${muted
          ? "hover:bg-muted/40 opacity-60 hover:opacity-100"
          : "hover:bg-muted/50 hover:shadow-improved"
        }`}
    >
      <div className="relative shrink-0">
        <ProfileAvatar
          displayName={friend.name}
          username={friend.username}
          profilePhoto={friend.profile_photo}
          sizeClass="h-10 w-10"
          fallbackTextClassName="text-sm"
        />
        <PresenceStatusDot userId={friend.user_id} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {friend.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          @{friend.username} · {getStatusLabel(status)}
        </p>
      </div>

      <FriendMessageButton
        userId={friend.user_id}
        onSuccess={onMessageSuccess}
      />
    </div>
  );
}

function EmptyFriends() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="p-4 rounded-2xl bg-muted/40">
        <Users className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Nenhum amigo ainda</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
          Quando houver follow mútuo com alguém, eles aparecem aqui.
        </p>
      </div>
    </div>
  );
}
