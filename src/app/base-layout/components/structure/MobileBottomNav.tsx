"use client";

import { Home, Swords, DoorOpen, Clapperboard } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { profilePhotoToAvatarSrc } from "@/components/profile/ProfileAvatar";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileContext } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", href: "/feed" },
  { icon: Clapperboard, label: "Cuts", href: "/cuts" },
  { icon: Swords, label: "Duo", href: "/duo" },
  { icon: DoorOpen, label: "Salas", href: "/rooms" },
] as const;

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();

  const isProfileActive = user
    ? pathname?.startsWith(`/profile/${user.username}`)
    : false;

  const profilePhoto = profile?.profile_photo
    ? profilePhotoToAvatarSrc(profile.profile_photo)
    : null;

  const initials = user
    ? (user.first_name?.[0] ?? user.username?.[0] ?? "?").toUpperCase()
    : "?";

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-5 items-stretch px-2">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive =
            href === "/feed"
              ? pathname === "/feed"
              : pathname?.startsWith(href);

          return (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          );
        })}

        {user ? (
          <button
            type="button"
            onClick={() => router.push(`/profile/${user.username}`)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors",
              isProfileActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Meu perfil"
            aria-current={isProfileActive ? "page" : undefined}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ring-2",
                isProfileActive ? "ring-primary" : "ring-border"
              )}
            >
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt=""
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold">{initials}</span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">Perfil</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground"
            aria-label="Entrar"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
              ?
            </span>
            <span className="text-[10px] font-medium leading-none">Entrar</span>
          </button>
        )}
      </div>
    </nav>
  );
}
