"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { apiFetch } from "@/services/apiFetch";
import { followProfile } from "@/services/followProfile";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { CustomToast } from "@/components/ui/customSonner";

type Suggestion = {
  id: number;
  user_id: string;
  username: string;
  name: string;
  profile_photo: string | null;
  reason: string;
  user_already_follow: boolean;
};

export function FollowSuggestionsCard() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/feed/suggestions", {
        credentials: "include",
      });
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data.filter((s) => !s.user_already_follow));
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFollow = async (profileId: number) => {
    try {
      await followProfile(profileId);
      setFollowingIds((prev) => new Set(prev).add(profileId));
      CustomToast.success("Você começou a seguir este jogador.");
    } catch {
      CustomToast.error("Não foi possível seguir este jogador.");
    }
  };

  const visible = suggestions.filter((s) => !followingIds.has(s.id));

  if (!loading && visible.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-card backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-glow-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <UserPlus className="h-5 w-5 text-neon-green" />
          <span>Quem seguir</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <LoadingComponent text="Carregando sugestões..." showText={false} />
        ) : (
          visible.slice(0, 5).map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"
            >
              <Link href={`/profile/${suggestion.username}`}>
                <ProfileAvatar
                  displayName={suggestion.name}
                  username={suggestion.username}
                  profilePhoto={suggestion.profile_photo}
                  sizeClass="h-9 w-9"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${suggestion.username}`}
                  className="block truncate text-sm font-medium text-foreground hover:text-primary"
                >
                  {suggestion.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {suggestion.reason}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-xs"
                onClick={() => void handleFollow(suggestion.id)}
              >
                Seguir
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
