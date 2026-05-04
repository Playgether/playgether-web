"use client";

import { favoriteToggleChatRoom } from "@/actions/favoriteToggleChatRoom";
import { cn } from "@/lib/utils";
import { ChatRoom } from "@/types/ChatRoom";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import {
  Image as ImageIcon,
  Info,
  LogOut,
  Menu,
  MessageSquare,
  Music,
  ScrollText,
  Settings,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  RoomMusicPanel,
  RoomRankingsPanel,
  RoomRolesPanel,
  RoomSettingsPanel,
} from "./RoomAdvancedPanels";
import { RoomInfoPanel, RoomRulesPanel } from "./RoomDetailsPanel";
import RoomChatMessagesPanel from "./RoomChatMessagesPanel";
import RoomParticipantsPanel from "./RoomParticipantsPanel";
import RoomImagesPanel from "./RoomImagesPanel";

type RoomTab =
  | "chat"
  | "participants"
  | "info"
  | "rules"
  | "rankings"
  | "roles"
  | "music"
  | "settings"
  | "images";

interface RoomChatViewProps {
  room: ChatRoom;
  messages: ChatRoomMessages[];
}

const tabs: { id: RoomTab; icon: typeof MessageSquare; label: string }[] = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "participants", icon: Users, label: "Participantes" },
  { id: "info", icon: Info, label: "Info" },
  { id: "rules", icon: ScrollText, label: "Regras" },
  { id: "images", icon: ImageIcon, label: "Imagens" },
  { id: "rankings", icon: Trophy, label: "Rankings" },
  { id: "roles", icon: Shield, label: "Cargos" },
  { id: "music", icon: Music, label: "Música" },
  { id: "settings", icon: Settings, label: "Config" },
];

export default function RoomChatView({ room, messages }: RoomChatViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RoomTab>("chat");
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(room.is_favorited ?? false);
  const [, startFavoriteTransition] = useTransition();

  const handleToggleFavorite = () => {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);

    startFavoriteTransition(async () => {
      await favoriteToggleChatRoom(room.slug, nextFavorite ? "POST" : "DELETE");
    });
  };

  const renderPanel = () => {
    switch (activeTab) {
      case "participants":
        return (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <RoomParticipantsPanel />
            <div className="hidden min-h-0 flex-1 md:flex">
              <RoomChatMessagesPanel messages={messages} room={room} />
            </div>
          </div>
        );
      case "info":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomInfoPanel room={room} />
          </div>
        );
      case "rules":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomRulesPanel room={room} />
          </div>
        );
      case "images":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomImagesPanel room={room} />
          </div>
        );
      case "rankings":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomRankingsPanel roomName={room.group_name} />
          </div>
        );
      case "roles":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomRolesPanel roomName={room.group_name} />
          </div>
        );
      case "music":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomMusicPanel roomName={room.group_name} />
          </div>
        );
      case "settings":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomSettingsPanel room={room} />
          </div>
        );
      case "chat":
      default:
        return <RoomChatMessagesPanel messages={messages} room={room} />;
    }
  };

  return (
    <section className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background">
      <nav className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="hidden items-center justify-between gap-0.5 px-2 py-1.5 md:flex">
          <div className="min-w-0 flex-shrink-0">
            <span className="truncate text-sm font-bold text-foreground hyphens-none whitespace-normal">
              {room.group_name}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-shrink-0 p-2 transition-colors",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <tab.icon className="h-4 w-4" />
                {activeTab === tab.id ? (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full gradient-primary" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex flex-shrink-0 items-center">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={cn(
                "rounded-md p-2 transition-colors",
                isFavorite
                  ? "text-neon-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={isFavorite ? "Remover favorito" : "Favoritar"}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={() => router.push("/rooms")}
              className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
              title="Sair da sala"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-2 py-1.5">
            <div className="flex min-w-0 flex-shrink items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSidebar((current) => !current)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Abrir participantes"
              >
                <Menu className="h-4 w-4" />
              </button>
              <span className="truncate text-sm font-bold text-foreground hyphens-none whitespace-normal">
                {room.group_name}
              </span>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={cn(
                  "rounded-md p-2 transition-colors",
                  isFavorite
                    ? "text-neon-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={isFavorite ? "Remover favorito" : "Favoritar"}
              >
                <Star
                  className={cn("h-4 w-4", isFavorite && "fill-current")}
                />
              </button>
              <button
                type="button"
                onClick={() => router.push("/rooms")}
                className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
                title="Sair da sala"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center overflow-x-auto px-2 py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-shrink-0 p-2 transition-colors",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <tab.icon className="h-4 w-4" />
                {activeTab === tab.id ? (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full gradient-primary" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {showSidebar ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
              onClick={() => setShowSidebar(false)}
              aria-label="Fechar participantes"
            />
            <div className="fixed bottom-0 left-0 top-0 z-40 md:hidden">
              <RoomParticipantsPanel onClose={() => setShowSidebar(false)} />
            </div>
          </>
        ) : null}
        {renderPanel()}
      </div>
    </section>
  );
}
