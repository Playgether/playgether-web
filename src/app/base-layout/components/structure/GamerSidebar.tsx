"use client";

import {
  Home,
  MessageCircle,
  Users,
  GamepadIcon,
  Trophy,
  Swords,
  Plus,
  DoorOpen,
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

const sidebarItems: GamerSideBarItensInterface[] = [
  { icon: <Home className="w-6 h-6" />, label: "Início", href: "/feed" },
  { icon: <Swords className="w-6 h-6" />, label: "Duo", href: "/duo" },
  { icon: <DoorOpen className="w-6 h-6" />, label: "Salas", href: "/rooms" },
  // {
  //   icon: <MessageCircle className="w-6 h-6" />,
  //   label: "Mensagens",
  //   notifications: 3,
  //   action: "conversations",
  // },
  {
    icon: <Users className="w-6 h-6" />,
    label: "Amigos",
    action: "friends",
  },
  // { icon: <Trophy className="w-6 h-6" />, label: "Rankings" },
  // { icon: <GamepadIcon className="w-6 h-6" />, label: "Jogos", href: "/profile/biblioteca" },
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

  return (
    <div className="group/sidebar fixed left-0 top-0 h-full w-20 hover:w-56 transition-[width] duration-300 ease-in-out bg-gradient-primary z-50 flex flex-col items-center py-6 border-r border-sidebar-border overflow-hidden">
      {/* Logo/Brand */}
      <div className="mb-8 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
        <GamepadIcon className="w-8 h-8 text-white" />
      </div>

      {/* Create Post Button */}
      <button
        type="button"
        aria-label="Criar"
        title="Criar"
        onClick={() => createPostContext?.handleCreatePostModal(true)}
        className="mb-4 w-full h-14 flex items-center rounded-xl px-3 text-white/80 hover:text-white hover:bg-white/20 hover:shadow-glow-neon hover:scale-[1.02] transition-all duration-300"
      >
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </div>
        <span className="overflow-hidden whitespace-nowrap text-sm font-medium max-w-0 opacity-0 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100 transition-all duration-300 delay-100">
          Criar
        </span>
      </button>

      {/* Navigation Items */}
      <nav className="w-full flex-1 flex flex-col space-y-1 px-3">
        {sidebarItems.map((item, index) => (
          <GamerSidbarConversationsButtons key={index} item={item} />
        ))}

        {/* Profile item inline — precisa de controle da estrutura para o status dot */}
        {/* div em vez de button porque PresenceStatusDot (allowPicker) já é um button — button-in-button é HTML inválido */}
        {user && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Meu perfil"
            title="Meu perfil"
            onClick={() => router.push(`/profile/${user.username}`)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(`/profile/${user.username}`); }}
            className={cn(
              "w-full h-14 flex items-center rounded-xl transition-all duration-300 cursor-pointer",
              "hover:bg-white/20 hover:shadow-glow-neon hover:scale-[1.02]",
              isProfileActive
                ? "bg-white/20 text-white shadow-glow-neon"
                : "text-white/80 hover:text-white"
            )}
          >
            <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-400/60 shadow-[0_0_10px_2px_rgba(168,85,247,0.35)] hover:ring-purple-300 hover:shadow-[0_0_16px_4px_rgba(168,85,247,0.55)] flex items-center justify-center">
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
            <span className="overflow-hidden whitespace-nowrap text-sm font-medium max-w-0 opacity-0 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100 transition-all duration-300 delay-100">
              Meu perfil
            </span>
          </div>
        )}
      </nav>
    </div>
  );
};
