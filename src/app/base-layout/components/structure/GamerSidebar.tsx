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
import { Button } from "@/components/ui/button";
import { useCreatePostContext } from "@/context/CreatePostContext";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileContext } from "@/context/ProfileContext";
import { GamerSideBarItensInterface } from "../../types/structure/GamerSideBarItensInterface";
import GamerSidbarConversationsButtons from "./GameSideBarConversationsButton";

const sidebarItems: GamerSideBarItensInterface[] = [
  { icon: <Home className="w-6 h-6" />, label: "Início", active: true, href: "/feed" },
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

  const initials = user
    ? (user.first_name?.[0] ?? user.username?.[0] ?? "?").toUpperCase()
    : "?";

  const profileIcon = profile?.profile_photo ? (
    <Image
      src={profilePhotoToAvatarSrc(profile.profile_photo) ?? ""}
      alt={user?.username ?? ""}
      width={56}
      height={56}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-white font-bold text-lg leading-none">{initials}</span>
  );

  const navItems: GamerSideBarItensInterface[] = [
    ...sidebarItems,
    ...(user
      ? [{ icon: profileIcon, label: "Meu perfil", href: `/profile/${user.username}`, rounded: "full" as const }]
      : []),
  ];

  return (
    <div className="group/sidebar fixed left-0 top-0 h-full w-20 hover:w-56 transition-[width] duration-300 ease-in-out bg-gradient-primary z-50 flex flex-col items-center py-6 border-r border-sidebar-border overflow-hidden">
      {/* Logo/Brand */}
      <div className="mb-8 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
        <GamepadIcon className="w-8 h-8 text-white" />
      </div>

      {/* Create Post Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        aria-label="Criar post"
        title="Criar post"
        onClick={() => createPostContext?.handleCreatePostModal(true)}
        className="mb-4 w-14 h-14 rounded-xl text-white/80 hover:text-white hover:bg-white/20 hover:shadow-glow-neon hover:scale-105 transition-all duration-300"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Navigation Items */}
      <nav className="w-full flex-1 flex flex-col space-y-1 px-3">
        {navItems.map((item, index) => (
          <GamerSidbarConversationsButtons key={index} item={item} />
        ))}
      </nav>
    </div>
  );
};
