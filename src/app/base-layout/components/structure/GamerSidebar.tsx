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

const sidebarItems: GamerSideBarItensInterface[] = [
  { icon: <Home className="w-6 h-6" />, label: "Início", href: "/feed" },
  { icon: <Clapperboard className="w-6 h-6" />, label: "Cuts", href: "/cuts" },
  { icon: <Swords className="w-6 h-6" />, label: "Duo", href: "/duo" },
  { icon: <DoorOpen className="w-6 h-6" />, label: "Salas", href: "/rooms" },
  {
    icon: <Users className="w-6 h-6" />,
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
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-white font-bold text-lg leading-none">{initials}</span>
  );

  const isProfileActive = user ? pathname?.startsWith(`/profile/${user.username}`) : false;
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="group/sidebar fixed left-0 top-0 z-50 flex h-full w-20 flex-col items-center overflow-hidden border-r border-sidebar-border bg-gradient-primary py-6 transition-[width] duration-300 ease-in-out hover:w-56">
      <div className="mb-8 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
        <GamepadIcon className="h-8 w-8 text-white" />
      </div>

      <button
        type="button"
        aria-label="Criar"
        title="Criar"
        onClick={() => createPostContext?.handleCreatePostModal(true)}
        className="mb-4 flex h-14 w-full items-center rounded-xl px-3 text-white/80 transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 hover:text-white hover:shadow-glow-neon"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center">
          <Plus className="h-6 w-6" />
        </div>
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all delay-100 duration-300 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100">
          Criar
        </span>
      </button>

      <nav className="flex w-full flex-1 flex-col space-y-1 px-3">
        {sidebarItems.map((item, index) => (
          <GamerSidbarConversationsButtons key={index} item={item} />
        ))}

        {user && (
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
              "flex h-14 w-full cursor-pointer items-center rounded-xl transition-all duration-300",
              "hover:scale-[1.02] hover:bg-white/20 hover:shadow-glow-neon",
              isProfileActive
                ? "bg-white/20 text-white shadow-glow-neon"
                : "text-white/80 hover:text-white"
            )}
          >
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-purple-400/60 shadow-[0_0_10px_2px_rgba(168,85,247,0.35)] hover:ring-purple-300 hover:shadow-[0_0_16px_4px_rgba(168,85,247,0.55)]">
                  {profileIcon}
                </div>
                <PresenceStatusDot
                  userId={user.user_id}
                  allowPicker
                  sizeClass="w-3.5 h-3.5"
                  borderClass="border-2 border-purple-700"
                />
              </div>
            </div>
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all delay-100 duration-300 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100">
              Meu perfil
            </span>
          </div>
        )}
        {/* Feedback — separado na base do nav */}
        <div className="mt-auto pt-2">
          <button
            type="button"
            aria-label="Feedback"
            title="Feedback"
            onClick={() => setFeedbackOpen(true)}
            className="flex h-14 w-full items-center rounded-xl text-white/60 transition-all duration-300 hover:bg-white/20 hover:text-white"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all delay-100 duration-300 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100">
              Feedback
            </span>
          </button>
        </div>
      </nav>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};
