"use client";

import { favoriteToggleChatRoom } from "@/actions/favoriteToggleChatRoom";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomEventSession } from "@/context/RoomEventSessionContext";
import { cn } from "@/lib/utils";
import { ChatRoom } from "@/types/ChatRoom";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import {
  CalendarDays,
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
  Radio,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
import RoomEventsPanel from "./RoomEventsPanel";
import { RoomEventInviteModal } from "./RoomEventInviteModal";
import { RoomEventLiveSession } from "./RoomEventLiveSession";
import { RoomMusicDock } from "./RoomMusicDock";
import RoomAmbiencePanel from "./RoomAmbiencePanel";

type RoomTab =
  | "chat"
  | "participants"
  | "info"
  | "rules"
  | "rankings"
  | "roles"
  | "music"
  | "settings"
  | "images"
  | "events"
  | "ambience";

interface RoomChatViewProps {
  room: ChatRoom;
  messages: ChatRoomMessages[];
  /** Cursor `next` da primeira página — mais mensagens ao scrollar para cima. */
  initialMessagesNextPageUrl?: string | null;
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
  { id: "events", icon: CalendarDays, label: "Eventos" },
  { id: "ambience", icon: Radio, label: "Ao vivo" },
];

export default function RoomChatView({
  room,
  messages,
  initialMessagesNextPageUrl = null,
}: RoomChatViewProps) {
  const router = useRouter();
  const { eventShellOpen, activeEvent } = useRoomEventSession();
  const { messagesQuantity, resetMessagesQuantity, setChatSurfaceHidden, roomAmbience } =
    useChatHandlerContext();
  const [activeTab, setActiveTab] = useState<RoomTab>("chat");
  const [ambienceEntered, setAmbienceEntered] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(room.is_favorited ?? false);
  const [ambientImages, setAmbientImages] = useState<Record<string, string>>(
    room.ambient_images ?? {}
  );
  const [, startFavoriteTransition] = useTransition();

  const immersionAmbience =
    roomAmbience.active && ambienceEntered && !eventShellOpen;

  useEffect(() => {
    setChatSurfaceHidden(
      activeTab !== "chat" || eventShellOpen || immersionAmbience,
    );
  }, [activeTab, eventShellOpen, immersionAmbience, setChatSurfaceHidden]);

  useEffect(() => {
    if (!roomAmbience.active) setAmbienceEntered(false);
  }, [roomAmbience.active]);

  const handleSelectTab = (id: RoomTab) => {
    setActiveTab(id);
    if (id === "chat") {
      resetMessagesQuantity();
    }
  };

  const visibleTabs = tabs.filter((tab) => {
    if (tab.id !== "ambience") return true;
    return roomAmbience.active;
  });

  useEffect(() => {
    if (!roomAmbience.active && activeTab === "ambience") {
      setActiveTab("chat");
    }
  }, [roomAmbience.active, activeTab]);

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
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            <RoomParticipantsPanel />
            <div className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
              <RoomChatMessagesPanel
                messages={messages}
                room={{ ...room, ambient_images: ambientImages }}
                initialMessagesNextPageUrl={initialMessagesNextPageUrl}
              />
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
            <RoomImagesPanel
              room={room}
              onAmbientImagesUpdated={setAmbientImages}
            />
          </div>
        );
      case "rankings":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomRankingsPanel roomName={room.group_name} />
          </div>
        );
      case "events":
        return (
          <div className="min-h-0 flex-1 overflow-hidden">
            <RoomEventsPanel room={room} />
          </div>
        );
      case "ambience":
        return (
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <RoomAmbiencePanel
              roomSlug={room.slug}
              entered={ambienceEntered}
              onEnteredChange={setAmbienceEntered}
            />
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
        return (
          <RoomChatMessagesPanel
            messages={messages}
            room={{ ...room, ambient_images: ambientImages }}
            initialMessagesNextPageUrl={initialMessagesNextPageUrl}
          />
        );
    }
  };

  if (eventShellOpen && activeEvent) {
    const finished = activeEvent.status === "finished";
    return (
      <>
        <RoomEventInviteModal roomSlug={room.slug} />
        <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {finished ? "Evento encerrado" : "Evento ao vivo"}
              </p>
              <p className="truncate text-sm font-bold text-foreground">{activeEvent.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {finished
                  ? "Confira a Pontuação abaixo. Use o botão para voltar ao chat da sala."
                  : "As outras abas da sala ficam bloqueadas até o encerramento."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/rooms")}
              className="shrink-0 rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
              title="Sair da sala"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </header>
          <div className="relative flex min-h-[min(70dvh,100%)] flex-1 flex-col overflow-hidden overflow-x-hidden p-2 md:min-h-0 md:p-3">
            <div className="min-h-0 flex-1 overflow-y-auto md:overflow-hidden">
              <RoomEventLiveSession room={room} />
            </div>
            <RoomMusicDock mountSuffix={room.slug} />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <RoomEventInviteModal roomSlug={room.slug} />
      <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background">
      {immersionAmbience ? (
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/80 px-3 py-2 backdrop-blur-sm">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Transmissão ao vivo
            </p>
            <p className="truncate text-sm font-bold text-foreground">{room.group_name}</p>
            <p className="text-[10px] text-muted-foreground">
              Modo Ambiente — vídeo sincronizado para a sala.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/rooms")}
            className="shrink-0 rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
            title="Sair da sala"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
      ) : null}
      <nav
        className={cn(
          "shrink-0 border-b border-border bg-card/80 backdrop-blur-sm",
          immersionAmbience && "hidden",
        )}
      >
        <div className="hidden items-center justify-between gap-0.5 px-2 py-1.5 md:flex">
          <div className="min-w-0 flex-shrink-0">
            <span className="truncate text-sm font-bold text-foreground hyphens-none whitespace-normal">
              {room.group_name}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={cn(
                  "relative flex-shrink-0 p-2 transition-colors",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <tab.icon className="h-4 w-4" />
                {tab.id === "chat" && activeTab !== "chat" && messagesQuantity > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                    {messagesQuantity > 99 ? "99+" : messagesQuantity}
                  </span>
                ) : null}
                {tab.id === "ambience" ? (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
                ) : null}
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
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={cn(
                  "relative flex-shrink-0 p-2 transition-colors",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <tab.icon className="h-4 w-4" />
                {tab.id === "chat" && activeTab !== "chat" && messagesQuantity > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                    {messagesQuantity > 99 ? "99+" : messagesQuantity}
                  </span>
                ) : null}
                {tab.id === "ambience" ? (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
                ) : null}
                {activeTab === tab.id ? (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full gradient-primary" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
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
        <RoomMusicDock mountSuffix={room.slug} />
      </div>
    </section>
    </>
  );
}
