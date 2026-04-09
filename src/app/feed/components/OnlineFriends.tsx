"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import { apiFetch } from "@/services/apiFetch";
import { PresenceContext } from "@/context/PresenceContext";

type FriendApi = {
  id: number;
  user_id: number;
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
    default:
      return "Offline";
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "online":
      return "status-online";
    case "away":
    case "dnd":
      return "status-away";
    default:
      return "status-offline";
  }
};

function isActiveOnApp(status: string) {
  return status === "online" || status === "away" || status === "dnd";
}

export const OnlineFriends = () => {
  const router = useRouter();
  const presenceCtx = useContext(PresenceContext);
  const [friends, setFriends] = useState<FriendApi[]>([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
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
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getPresence = presenceCtx?.getPresence;

  const visibleFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...friends];
    list.sort((a, b) => a.name.localeCompare(b.name, "pt"));
    list = list.filter((f) => {
      const st = getPresence
        ? getPresence(f.user_id).status
        : f.presence?.status || "offline";
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
  }, [friends, query, getPresence]);

  const slice = showAll ? visibleFriends : visibleFriends.slice(0, 8);

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
            className="pl-10 bg-muted/50 border-border/50 focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loadError ? (
          <p className="text-xs text-destructive">{loadError}</p>
        ) : null}

        {slice.map((friend) => {
          const st = getPresence
            ? getPresence(friend.user_id).status
            : friend.presence?.status || "offline";
          const photoSrc = resolveGameMediaUrl(friend.profile_photo);
          const initials =
            friend.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ||
            friend.username[0]?.toUpperCase() ||
            "?";

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
              className="flex items-center space-x-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 hover:shadow-improved transition-all duration-200 cursor-pointer group"
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={photoSrc || undefined} alt={friend.name} />
                  <AvatarFallback className="bg-gradient-primary text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                    getStatusClass(st),
                  )}
                />
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
      </CardContent>
    </Card>
  );
};
