"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserCheck, UserPlus, Users } from "lucide-react";
import { apiFetch } from "@/services/apiFetch";
import { followProfile } from "@/services/followProfile";
import { unfollowProfile } from "@/services/unfollowProfile";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { notifyFriendsListChanged } from "@/lib/friendsListEvents";
import { useProfileContext } from "@/context/ProfileContext";

type FollowUser = {
  id: number;
  user_id: number;
  username: string;
  name: string;
  profile_photo: string | null;
  user_already_follow: boolean;
};

interface FollowListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: number;
  type: "followers" | "following";
}

export function FollowListModal({
  open,
  onOpenChange,
  profileId,
  type,
}: FollowListModalProps) {
  const router = useRouter();
  const { profile: myProfile, fetchProfile } = useProfileContext();
  const myProfileRef = useRef(myProfile);
  useEffect(() => { myProfileRef.current = myProfile; }, [myProfile]);

  const [users, setUsers] = useState<FollowUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingState, setFollowingState] = useState<Record<number, boolean>>({});

  const endpoint =
    type === "followers"
      ? `/api/profiles/${profileId}/followers`
      : `/api/profiles/${profileId}/following`;

  const title = type === "followers" ? "Seguidores" : "Seguindo";

  const fetchUsers = useCallback(async () => {
    const res = await apiFetch(endpoint, { credentials: "include" });
    if (!res.ok) throw new Error("Não foi possível carregar a lista.");
    const data = (await res.json()) as FollowUser[];
    return Array.isArray(data) ? data : [];
  }, [endpoint]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setError(null);
    setLoading(true);

    const init = async () => {
      try {
        const [latestProfile, list] = await Promise.all([
          myProfileRef.current ? Promise.resolve(myProfileRef.current) : fetchProfile(),
          fetchUsers(),
        ]);

        setUsers(list);

        const followSet = new Set(
          Array.isArray(latestProfile?.follows) ? latestProfile.follows : [],
        );

        const state: Record<number, boolean> = {};
        list.forEach((u) => {
          state[u.id] = followSet.size > 0
            ? followSet.has(u.id)
            : (u.user_already_follow ?? false);
        });
        setFollowingState(state);
      } catch (e: any) {
        setError(e?.message ?? "Erro ao carregar a lista.");
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [open, fetchUsers, fetchProfile]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [users, query]);

  const handleToggleFollow = async (user: FollowUser) => {
    const prev = followingState[user.id] ?? false;
    setFollowingState((s) => ({ ...s, [user.id]: !prev }));
    try {
      if (prev) {
        await unfollowProfile(user.id);
      } else {
        await followProfile(user.id);
      }
      notifyFriendsListChanged();
    } catch {
      setFollowingState((s) => ({ ...s, [user.id]: prev }));
    }
  };

  const handleNavigate = (username: string) => {
    router.push(`/profile/${username}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0 bg-background/95 backdrop-blur-xl border border-primary/20 gap-0 max-h-[85vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </span>
            {!loading && users.length > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {users.length}
              </span>
            )}
          </DialogTitle>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50 focus:ring-2 focus:ring-primary/30"
              disabled={loading}
            />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-3 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingComponent
                  text="Carregando..."
                  showText
                  className="text-muted-foreground"
                />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive text-center py-8">{error}</p>
            ) : filtered.length === 0 ? (
              <EmptyState type={type} hasQuery={!!query} />
            ) : (
              filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isFollowing={followingState[user.id] ?? false}
                  showFollowBack={type === "followers" && !(followingState[user.id] ?? false)}
                  onNavigate={handleNavigate}
                  onToggleFollow={handleToggleFollow}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function UserRow({
  user,
  isFollowing,
  showFollowBack,
  onNavigate,
  onToggleFollow,
}: {
  user: FollowUser;
  isFollowing: boolean;
  showFollowBack: boolean;
  onNavigate: (username: string) => void;
  onToggleFollow: (user: FollowUser) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200 group">
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        onClick={() => onNavigate(user.username)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onNavigate(user.username);
        }}
      >
        <ProfileAvatar
          displayName={user.name}
          username={user.username}
          profilePhoto={user.profile_photo}
          sizeClass="h-10 w-10 shrink-0"
          fallbackTextClassName="text-sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {user.username}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.name}</p>
        </div>
      </div>

      {showFollowBack ? (
        <Button
          size="sm"
          variant="default"
          className="shrink-0 h-8 px-3 text-xs bg-gradient-primary border-0 hover:shadow-neon transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFollow(user);
          }}
        >
          <UserPlus className="w-3 h-3 mr-1" />
          Seguir de volta
        </Button>
      ) : isFollowing ? (
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFollow(user);
          }}
        >
          <UserCheck className="w-3 h-3 mr-1" />
          Seguindo
        </Button>
      ) : null}
    </div>
  );
}

function EmptyState({
  type,
  hasQuery,
}: {
  type: "followers" | "following";
  hasQuery: boolean;
}) {
  if (hasQuery) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum resultado encontrado.
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="p-4 rounded-2xl bg-muted/40">
        <Users className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          {type === "followers" ? "Nenhum seguidor ainda" : "Não está seguindo ninguém"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
          {type === "followers"
            ? "Quando alguém te seguir, aparecerá aqui."
            : "Comece a seguir pessoas para vê-las aqui."}
        </p>
      </div>
    </div>
  );
}
