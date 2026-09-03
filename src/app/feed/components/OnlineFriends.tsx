"use client";

import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/apiFetch";
import { PresenceContext } from "@/context/PresenceContext";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileContext } from "@/context/ProfileContext";
import { subscribeFriendsListInvalidate } from "@/lib/friendsListEvents";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { FriendsModal } from "@/app/base-layout/components/friends/FriendsModal";
import { FriendMessageButton } from "@/app/base-layout/components/friends/FriendMessageButton";

type FriendApi = {
  id: number;
  user_id: string | number;
  username: string;
  name: string;
  profile_photo: string | null;
  presence: { status: string; last_seen: string | null };
};

const FRIENDS_PREVIEW = 5;

const getStatusLabel = (status: string) => {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Ausente";
    case "dnd":
      return "Não perturbe";
    case "offline":
      return "Invisível";
    default:
      return "Offline";
  }
};

function isActiveOnApp(status: string) {
  return status === "online" || status === "away" || status === "dnd";
}

/** Até o WS de presença abrir, usa o status da API (cache); depois, o estado ao vivo. */
function friendPresenceStatus(
  f: FriendApi,
  presenceCtx: React.ContextType<typeof PresenceContext>,
): string {
  if (!presenceCtx?.isPresenceConnected) {
    return (
      f.presence?.status ||
      presenceCtx?.getPresence(f.user_id).status ||
      "offline"
    );
  }
  return presenceCtx.getPresence(f.user_id).status;
}

export const OnlineFriends = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { profile, fetchProfile } = useProfileContext();
  const presenceCtx = useContext(PresenceContext);
  const [friends, setFriends] = useState<FriendApi[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listReady, setListReady] = useState(() => !user?.user_id);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async (opts?: { soft?: boolean }) => {
    setLoadError(null);
    if (!opts?.soft) setListReady(false);
    try {
      const res = await apiFetch("/api/profiles/friends", {
        credentials: "include",
      });
      if (!res.ok) {
        setFriends([]);
        return;
      }
      const data = (await res.json()) as FriendApi[];
      setFriends(Array.isArray(data) ? data : []);
    } catch {
      setLoadError("Não foi possível carregar amigos.");
      setFriends([]);
    } finally {
      setListReady(true);
    }
  }, []);

  useEffect(() => {
    if (!user?.user_id) {
      setListReady(true);
      setFriends([]);
      return;
    }
    void load();
  }, [user?.user_id, load]);

  useEffect(() => {
    return subscribeFriendsListInvalidate(() => void load({ soft: true }));
  }, [load]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    const onVis = () => {
      if (document.visibilityState !== "visible" || !user?.user_id) return;
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        void load({ soft: true });
        t = null;
      }, 400);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (t) clearTimeout(t);
    };
  }, [load, user?.user_id]);

  useEffect(() => {
    if (user?.user_id && !profile?.profile_photo) {
      void fetchProfile();
    }
  }, [user?.user_id, profile?.profile_photo, fetchProfile]);

  const visibleFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = friends.filter((f) => String(f.user_id) !== String(user?.user_id));
    list.sort((a, b) => a.name.localeCompare(b.name, "pt"));
    list = list.filter((f) => {
      const st = friendPresenceStatus(f, presenceCtx ?? null);
      return isActiveOnApp(st);
    });
    if (q) {
      list = list.filter(
        (f) =>
          f.username.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [friends, query, presenceCtx, user?.user_id]);

  const slice = visibleFriends.slice(0, FRIENDS_PREVIEW);
  const showFriendsSkeleton = Boolean(user?.user_id) && !listReady && !loadError;

  return (
    <>
      <Card className="flex max-h-[calc(100dvh-var(--layout-header-height)-3.5rem)] min-w-0 w-full flex-col overflow-hidden border-border/50 bg-card backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:border-primary/40 transition-all duration-300">
        <CardHeader className="shrink-0 pb-4">
          <CardTitle className="text-lg font-bold">Amigos online</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={showFriendsSkeleton}
              className="border-border/50 bg-muted/60 pl-10 focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {loadError ? (
            <p className="text-xs text-destructive">{loadError}</p>
          ) : null}

          {showFriendsSkeleton ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center py-8">
              <LoadingComponent
                text="Carregando amigos..."
                showText
                className="text-muted-foreground"
              />
            </div>
          ) : (
            <>
              {user?.user_id != null ? (
                <div className="mb-1 flex items-center gap-3 border-b border-border/50 pb-3">
                  <div className="relative shrink-0">
                    <ProfileAvatar
                      displayName={
                        `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                        user.username
                      }
                      username={user.username}
                      profilePhoto={profile?.profile_photo}
                      sizeClass="h-10 w-10"
                      fallbackTextClassName="text-sm"
                    />
                    <PresenceStatusDot userId={user.user_id} allowPicker />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Seu status</p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {getStatusLabel(
                        presenceCtx?.getSelfPresenceDisplay().status ??
                          "offline",
                      )}
                    </p>
                  </div>
                </div>
              ) : null}

              {slice.map((friend) => {
                const st = friendPresenceStatus(friend, presenceCtx ?? null);

                return (
                  <div
                    key={friend.user_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/profile/${friend.username}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        router.push(`/profile/${friend.username}`);
                    }}
                    className="group flex cursor-pointer items-center space-x-3 rounded-xl bg-muted/60 p-3 transition-all duration-200 hover:bg-muted/80"
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

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {friend.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getStatusLabel(st)}
                      </p>
                    </div>

                    <FriendMessageButton userId={friend.user_id} />
                  </div>
                );
              })}

              {!loadError && friends.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum amigo ainda. Quando houver follow mútuo, aparece aqui.
                </p>
              ) : null}
              {!loadError && friends.length > 0 && visibleFriends.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum amigo online no momento.
                </p>
              ) : null}

              {user?.user_id != null && !loadError ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="block w-full pt-1 text-center text-xs font-medium text-primary hover:underline"
                >
                  Ver todos os amigos
                </button>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <FriendsModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};
