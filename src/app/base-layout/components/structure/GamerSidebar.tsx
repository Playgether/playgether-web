"use client";

import {
  Home,
  Users,
  GamepadIcon,
  Swords,
  Plus,
  DoorOpen,
  MessageSquarePlus,
  Clapperboard,
} from "lucide-react";
import Image from "next/image";
import { profilePhotoToAvatarSrc } from "@/components/profile/ProfileAvatar";
import { useCreatePostContext } from "@/context/CreatePostContext";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileContext } from "@/context/ProfileContext";
import { GamerSideBarItensInterface } from "../../types/structure/GamerSideBarItensInterface";
import GamerSidbarConversationsButtons from "./GameSideBarConversationsButton";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FeedbackDialog } from "../feedback/FeedbackDialog";

const navIconClass = "h-6 w-6 short:h-5 short:w-5";

const sidebarItems: GamerSideBarItensInterface[] = [
  { icon: <Home className={navIconClass} />, label: "Início", href: "/feed" },
  { icon: <Clapperboard className={navIconClass} />, label: "Cuts", href: "/cuts" },
  { icon: <Swords className={navIconClass} />, label: "Duo", href: "/duo" },
  { icon: <DoorOpen className={navIconClass} />, label: "Salas", href: "/rooms" },
  {
    icon: <Users className={navIconClass} />,
    label: "Amigos",
    action: "friends",
  },
];

export const GamerSidebar = () => {
  const createPostContext = useCreatePostContext();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  const router = useRouter();
  const pathname = usePathname();

  const initials = user
    ? (user.first_name?.[0] ?? user.username?.[0] ?? "?").toUpperCase()
    : "?";

  const profileIcon = profile?.profile_photo ? (
    <Image
      src={profilePhotoToAvatarSrc(profile.profile_photo) ?? ""}
      alt={user?.username ?? ""}
      width={40}
      height={40}
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="text-base font-bold leading-none text-white short:text-sm">
      {initials}
    </span>
  );

  const isProfileActive = user
    ? pathname?.startsWith(`/profile/${user.username}`)
    : false;
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="group/sidebar fixed left-0 top-0 z-50 flex h-full w-20 flex-col items-center overflow-hidden border-r border-sidebar-border bg-gradient-primary py-6 transition-[width] duration-300 ease-in-out short:py-3 hover:w-56">
      <div className="mb-8 rounded-xl bg-white/10 p-3 backdrop-blur-sm short:mb-3 short:p-2">
        <GamepadIcon className="h-8 w-8 text-white short:h-6 short:w-6" />
      </div>

      <button
        type="button"
        aria-label="Criar"
        title="Criar"
        onClick={() => createPostContext?.handleCreatePostModal(true)}
        className="mb-4 flex h-14 w-full items-center rounded-xl px-3 text-white/80 transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 hover:text-white hover:shadow-glow-neon short:mb-2 short:h-11"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center short:h-11">
          <Plus className="h-6 w-6 short:h-5 short:w-5" />
        </div>
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all delay-100 duration-300 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100">
          Criar
        </span>
      </button>

      <nav className="flex min-h-0 w-full flex-1 flex-col space-y-1 px-3 short:space-y-0.5">
        {sidebarItems.map((item, index) => (
          <GamerSidbarConversationsButtons key={index} item={item} />
        ))}

        {user ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Meu perfil"
            title="Meu perfil"
            onClick={() => router.push(`/profile/${user.username}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router.push(`/profile/${user.username}`);
              }
            }}
            className={cn(
              "flex h-14 w-full cursor-pointer items-center rounded-xl transition-all duration-300 short:h-11",
              "hover:scale-[1.02] hover:bg-white/20 hover:shadow-glow-neon",
              isProfileActive
                ? "bg-white/20 text-white shadow-glow-neon"
                : "text-white/80 hover:text-white"
            )}
          >
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center short:h-11">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-purple-400/60 shadow-[0_0_10px_2px_rgba(168,85,247,0.35)] hover:ring-purple-300 hover:shadow-[0_0_16px_4px_rgba(168,85,247,0.55)] short:h-8 short:w-8">
                  {profileIcon}
                </div>
                <PresenceStatusDot
                  userId={user.user_id}
                  allowPicker
                  sizeClass="h-3.5 w-3.5 short:h-3 short:w-3"
                  borderClass="border-2 border-purple-700"
                />
              </div>
            </div>
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all delay-100 duration-300 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100">
              Meu perfil
            </span>
          </div>
        ) : null}
      </nav>

      <div className="mt-auto flex w-full flex-col px-3 pb-1 pt-2">
        <div className="mx-auto mb-1 h-px w-8 bg-white/20" aria-hidden />
        <button
          type="button"
          aria-label="Feedback"
          title="Feedback"
          onClick={() => setFeedbackOpen(true)}
          className="flex h-14 w-full items-center rounded-xl text-white/60 transition-all duration-300 hover:bg-white/20 hover:text-white short:h-11"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center short:h-11">
            <MessageSquarePlus className="h-5 w-5 short:h-4 short:w-4" />
          </div>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all delay-100 duration-300 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100">
            Feedback
          </span>
        </button>
      </div>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};
