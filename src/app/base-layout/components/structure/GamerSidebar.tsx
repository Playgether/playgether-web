"use client";
import {
  Home,
  MessageCircle,
  Users,
  Settings,
  Bell,
  GamepadIcon,
  Trophy,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConversationsModal } from "../chat/ConversationsModal";
import { useState } from "react";

const sidebarItems = [
  { icon: Home, label: "Início", active: true },
  { icon: MessageCircle, label: "Mensagens", notifications: 3 },
  { icon: Users, label: "Amigos", notifications: 12 },
  { icon: Trophy, label: "Rankings" },
  { icon: GamepadIcon, label: "Jogos" },
  { icon: Headphones, label: "Streams" },
  { icon: Bell, label: "Notificações" },
  { icon: Settings, label: "Configurações" },
];

export const GamerSidebar = () => {
  const [conversationsOpen, setConversationsOpen] = useState(false);

  const handleItemClick = (label: string) => {
    if (label === "Mensagens") {
      setConversationsOpen(true);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-gradient-primary z-40 flex flex-col items-center py-6 border-r border-sidebar-border">
      {/* Logo/Brand */}
      <div className="mb-8 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
        <GamepadIcon className="w-8 h-8 text-white" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col space-y-3">
        {sidebarItems.map((item, index) => (
          <div key={index} className="relative group">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleItemClick(item.label)}
              className={cn(
                "w-14 h-14 rounded-xl transition-all duration-300 relative",
                "hover:bg-white/20 hover:shadow-glow-neon hover:scale-105",
                item.active
                  ? "bg-white/20 text-white shadow-glow-neon"
                  : "text-white/80 hover:text-white"
              )}
            >
              <item.icon className="w-6 h-6" />
              {item.notifications && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-secondary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
                  {item.notifications}
                </span>
              )}
            </Button>

            {/* Tooltip */}
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.label}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/90 rotate-45"></div>
            </div>
          </div>
        ))}
      </nav>

      {/* Search Button */}
      {/* <Button
        variant="ghost"
        size="icon"
        className="w-14 h-14 rounded-xl text-white/80 hover:text-white hover:bg-white/20 hover:shadow-glow-neon hover:scale-105 transition-all duration-300 mb-4"
      >
        <Search className="w-6 h-6" />
      </Button> */}

      <ConversationsModal
        open={conversationsOpen}
        onOpenChange={setConversationsOpen}
      />
    </div>
  );
};
