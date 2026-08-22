"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { followProfile } from "@/services/followProfile";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { CustomToast } from "@/components/ui/customSonner";
import { useAuthContext } from "@/context/AuthContext";
import {
  FollowSuggestionsModal,
  useFollowSuggestions,
} from "./FollowSuggestionsModal";

const SUGGESTIONS_PREVIEW = 3;

export function FollowSuggestionsCard() {
  const { authSessionResolved, user } = useAuthContext();
  const { suggestions, loading, load, setLoading } = useFollowSuggestions();
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authSessionResolved || !user) {
      if (authSessionResolved && !user) setLoading(false);
      return;
    }
    void load();
  }, [authSessionResolved, user, load, setLoading]);

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
  const slice = visible.slice(0, SUGGESTIONS_PREVIEW);

  if (!loading && visible.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="flex max-h-[calc(100dvh-var(--layout-header-height)-3.5rem)] min-w-0 w-full flex-col overflow-hidden border-border/50 bg-card backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-glow-primary/30">
        <CardHeader className="shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <UserPlus className="h-5 w-5 text-neon-green" />
            <span>Quem seguir</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <LoadingComponent text="Carregando sugestões..." showText={false} />
          ) : (
            <>
              {slice.map((suggestion) => (
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
              ))}

              {visible.length > SUGGESTIONS_PREVIEW ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="block w-full pt-1 text-center text-xs font-medium text-primary hover:underline"
                >
                  Ver todos
                </button>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <FollowSuggestionsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        suggestions={suggestions}
        followingIds={followingIds}
        onFollowed={(profileId) =>
          setFollowingIds((prev) => new Set(prev).add(profileId))
        }
      />
    </>
  );
}
