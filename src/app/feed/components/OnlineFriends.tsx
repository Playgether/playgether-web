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

type FriendApi = {
  id: number;
  user_id: string | number;
  username: string;
  name: string;
  profile_photo: string | null;
  presence: { status: string; last_seen: string | null };
};

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
  const [showAll, setShowAll] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listReady, setListReady] = useState(() => !user?.user_id);

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
  }, [friends, query, presenceCtx]);

  const slice = showAll ? visibleFriends : visibleFriends.slice(0, 8);

  const showFriendsSkeleton = Boolean(user?.user_id) && !listReady && !loadError;

  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 ">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">Amigos online</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={showFriendsSkeleton}
            className="pl-10 bg-muted/60 border-border/50 focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loadError ? (
          <p className="text-xs text-destructive">{loadError}</p>
        ) : null}

        {showFriendsSkeleton ? (
          <div className="min-h-[220px] flex flex-col items-center justify-center py-8">
            <LoadingComponent
              text="Carregando amigos..."
              showText
              className="text-muted-foreground"
            />
          </div>
        ) : (
          <>
            {user?.user_id != null ? (
              <div className="flex items-center gap-3 pb-3 mb-1 border-b border-border/50">
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
                  <PresenceStatusDot
                    userId={user.user_id}
                    allowPicker
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Seu status</p>
                  <p className="text-sm font-medium text-foreground truncate">
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
                  className="flex items-center space-x-3 p-3 rounded-xl bg-muted/60 hover:bg-muted/80 transition-all duration-200 cursor-pointer group"
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
                    <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {friend.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStatusLabel(st)}
                    </p>
                  </div>
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

            {visibleFriends.length > 8 ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {showAll ? "Mostrar menos" : "Ver todos"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
};
