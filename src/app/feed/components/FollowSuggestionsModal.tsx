"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { apiFetch } from "@/services/apiFetch";
import { followProfile } from "@/services/followProfile";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { CustomToast } from "@/components/ui/customSonner";

export type FollowSuggestion = {
  id: number;
  user_id: string;
  username: string;
  name: string;
  profile_photo: string | null;
  reason: string;
  user_already_follow: boolean;
};

interface FollowSuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: FollowSuggestion[];
  followingIds: Set<number>;
  onFollowed: (profileId: number) => void;
}

export function FollowSuggestionsModal({
  open,
  onOpenChange,
  suggestions,
  followingIds,
  onFollowed,
}: FollowSuggestionsModalProps) {
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions.filter((s) => {
      if (followingIds.has(s.id) || s.user_already_follow) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q)
      );
    });
  }, [suggestions, followingIds, query]);

  const handleFollow = async (profileId: number) => {
    setPendingId(profileId);
    try {
      await followProfile(profileId);
      onFollowed(profileId);
      CustomToast.success("Você começou a seguir este jogador.");
    } catch {
      CustomToast.error("Não foi possível seguir este jogador.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden border border-primary/20 bg-background/95 p-0 backdrop-blur-xl sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-border/50 px-6 pb-4 pt-6">
          <DialogTitle className="mb-2 flex items-center gap-3 text-xl font-bold">
            <div className="rounded-xl bg-gradient-primary p-2">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Quem seguir
            </span>
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar jogador..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-border/50 bg-muted/50 pl-10 focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </DialogHeader>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-2 px-4 py-4">
            {visible.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {query.trim()
                  ? `Nenhuma sugestão para “${query.trim()}”.`
                  : "Nenhuma sugestão no momento."}
              </p>
            ) : (
              visible.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <Link
                    href={`/profile/${suggestion.username}`}
                    onClick={() => onOpenChange(false)}
                  >
                    <ProfileAvatar
                      displayName={suggestion.name}
                      username={suggestion.username}
                      profilePhoto={suggestion.profile_photo}
                      sizeClass="h-10 w-10"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${suggestion.username}`}
                      onClick={() => onOpenChange(false)}
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
                    disabled={pendingId === suggestion.id}
                    onClick={() => void handleFollow(suggestion.id)}
                  >
                    Seguir
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useFollowSuggestions() {
  const [suggestions, setSuggestions] = useState<FollowSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

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
        setSuggestions(data.filter((s: FollowSuggestion) => !s.user_already_follow));
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, loading, load, setLoading };
}
