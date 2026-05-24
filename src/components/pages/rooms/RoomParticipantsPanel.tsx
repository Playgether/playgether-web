"use client";

import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import { useAuthContext } from "@/context/AuthContext";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { usePresenceContext } from "@/context/PresenceContext";
import { Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

interface RoomParticipantsPanelProps {
  onClose?: () => void;
}

export default function RoomParticipantsPanel({
  onClose,
}: RoomParticipantsPanelProps) {
  const { onlineUsers } = useChatHandlerContext();
  const { user } = useAuthContext();
  const presenceCtx = usePresenceContext();
  const [search, setSearch] = useState("");

  const selfId = user?.user_id ?? null;

  const presenceFiltered = useMemo(() => {
    if (!presenceCtx.isPresenceConnected) {
      return onlineUsers;
    }
    return onlineUsers.filter((u) => {
      if (selfId != null && String(u.id) === String(selfId)) return true;
      const st = presenceCtx.getPresence(u.id).status;
      return st !== "offline";
    });
  }, [onlineUsers, presenceCtx, selfId]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return presenceFiltered;
    }

    return presenceFiltered.filter(
      (user) =>
        user.fullname.toLowerCase().includes(normalizedSearch) ||
        user.username.toLowerCase().includes(normalizedSearch)
    );
  }, [presenceFiltered, search]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/60 bg-card/95 backdrop-blur-sm md:w-72">
      <div className="border-b border-border/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Participantes
          </h2>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted md:hidden"
              aria-label="Fechar participantes"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar participantes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-border bg-muted/80 py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="group flex cursor-pointer items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-muted/60"
            >
              <div className="relative flex-shrink-0">
                <ProfileImagePost
                  link_photo={user.profile_photo}
                  username={user.username}
                  displayName={user.fullname}
                  className="h-10 w-10 ring-2 ring-border/60 transition-all group-hover:ring-primary/30"
                />
                <PresenceStatusDot
                  userId={user.id}
                  sizeClass="h-3 w-3"
                  borderClass="border-2 border-card"
                  allowPicker={
                    selfId != null && user.id === selfId
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate whitespace-nowrap text-sm font-semibold text-foreground">
                  {user.fullname}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Nenhum participante online encontrado.
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-border/60 p-3 text-center text-xs text-muted-foreground">
        <span className="status-online inline-block h-2 w-2 rounded-full" />
        {presenceFiltered.length} online
      </div>
    </aside>
  );
}
