"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import VerifiedProfile from "@/components/elements/VerifiedProfile";

type ProfileHover = {
  username: string;
  name: string;
  bio?: string | null;
  profile_photo?: string | null;
  verified?: boolean;
  private?: boolean;
  is_friend?: boolean;
};

const profileHoverCache = new Map<string, ProfileHover | "missing">();

async function fetchProfileHover(username: string): Promise<ProfileHover | "missing"> {
  const cached = profileHoverCache.get(username);
  if (cached) return cached;

  const res = await fetch(`/api/profiles/${encodeURIComponent(username)}`, {
    credentials: "include",
  });
  if (res.status === 403) {
    const value: ProfileHover = {
      username,
      name: username,
      private: true,
    };
    profileHoverCache.set(username, value);
    return value;
  }
  if (!res.ok) {
    profileHoverCache.set(username, "missing");
    return "missing";
  }
  const data = (await res.json()) as ProfileHover;
  profileHoverCache.set(username, data);
  return data;
}

export function MentionLink({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileHover | "missing" | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void fetchProfileHover(username).then((data) => {
      if (!cancelled) setProfile(data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, username]);

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={250} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Link
          href={`/profile/${username}`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "pointer-events-auto font-medium text-sky-400 hover:text-sky-300 hover:underline",
            className,
          )}
        >
          @{username}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-72 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        {profile == null ? (
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : profile === "missing" ? (
          <p className="text-sm text-muted-foreground">Perfil não encontrado.</p>
        ) : (
          <Link
            href={`/profile/${username}`}
            className="flex gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileAvatar
              displayName={profile.name || username}
              username={username}
              profilePhoto={profile.profile_photo}
              sizeClass="h-12 w-12"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate font-semibold text-foreground">
                  {profile.private ? username : profile.name || username}
                </p>
                {profile.verified ? <VerifiedProfile /> : null}
              </div>
              <p className="truncate text-sm text-muted-foreground">@{username}</p>
              {profile.private ? (
                <p className="mt-2 text-xs text-muted-foreground">Este perfil é privado.</p>
              ) : profile.bio ? (
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{profile.bio}</p>
              ) : null}
            </div>
          </Link>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
