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
import { GamerSideBarItensInterface } from "../../types/structure/GamerSideBarItensInterface";
import GamerSidbarConversationsButtons from "./GameSideBarConversationsButton";

const sidebarItems: GamerSideBarItensInterface[] = [
  { icon: <Home className="w-6 h-6" />, label: "Início", active: true },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    label: "Mensagens",
    notifications: 3,
  },
  { icon: <Users className="w-6 h-6" />, label: "Amigos", notifications: 12 },
  { icon: <Trophy className="w-6 h-6" />, label: "Rankings" },
  { icon: <GamepadIcon className="w-6 h-6" />, label: "Jogos" },
  { icon: <Headphones className="w-6 h-6" />, label: "Streams" },
  { icon: <Bell className="w-6 h-6" />, label: "Notificações" },
  { icon: <Settings className="w-6 h-6" />, label: "Configurações" },
];

export const GamerSidebar = () => {
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
            <GamerSidbarConversationsButtons item={item} />

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
    </div>
  );
};
