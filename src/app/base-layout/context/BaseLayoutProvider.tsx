import {
  Bell,
  Clock,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Palette,
  Reply,
  Search,
  Settings,
  Shield,
  Star,
  Sun,
  Volume2,
} from "lucide-react";
import ChatModalHeader from "../components/chat/ChatModalHeader";
import ChatTabs from "../components/chat/ChatTabs";
import NoConversationSelected from "../components/chat/NoConversationSelected";
import { BaseLayoutServerProvider } from "./BaseLayoutServerContext";
import NotificationsTitle from "../components/structure/NotificationsTitle";
import SettingsHeader from "../components/structure/SettingsHeader";
import { Separator } from "@/components/ui/separator";
import NoMessagesQuickMessages from "../components/structure/NoMessagesQuickMessages";
import QuickMessagesHistoryModalHeader from "../components/structure/QuickMessagesHistoryModalHeader";
import QuickMessagesModalHeader from "../components/structure/QuickMessagesModalHeader";
import QuickMessagesFooterTitle from "../components/structure/QuickMessagesFooterTitle";
import SearchChatBar from "../components/chat/SearchChatBar";
import NoImageClan from "../components/chat/NoImageClan";
import NoImageProfile from "@/components/general/NoImageProfile";
import NoImageGroup from "../components/chat/NoImageGroup";

export const BaseLayoutServerComponents = {
  ServerQuickMessagesModal: {
    components: {
      QuickMessagesModalHeader: <QuickMessagesModalHeader />,
    },
    icons: {
      Clock: <Clock className="w-4 h-4 text-muted-foreground" />,
      Reply: <Reply className="w-4 h-4 mr-2" />,
    },
  },
  ServerQuickMessagesHistoryModal: {
    components: {
      QuickMessagesHistoryModalHeader: <QuickMessagesHistoryModalHeader />,
    },
    icons: {
      Clock: <Clock className="w-4 h-4" />,
    },
  },
  ServerQuickMessagesFooter: {
    components: {
      NoMessagesQuickMessages: <NoMessagesQuickMessages />,
      QuickMessagesFooterTitle: <QuickMessagesFooterTitle />,
    },
  },
  ServerSettingsModal: {
    components: {
      SettingsHeader: <SettingsHeader />,
      Separator: <Separator className="mt-6 bg-border/50" />,
    },
    icons: {
      Pallete: <Palette className="w-5 h-5" />,
      Bell: <Bell className="w-5 h-5" />,
      Volume2: <Volume2 className="w-5 h-5" />,
      Shield: <Shield className="w-5 h-5" />,
    },
  },
  ServerNotificationsModal: {
    components: {
      NotificationsTitle: <NotificationsTitle />,
    },
    icons: {
      Star: (
        <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
      ),
    },
  },
  ServerConversationsModal: {
    components: {
      NoConversationSelected: <NoConversationSelected />,
      ChatTabs: <ChatTabs />,
      ChatModalHeader: <ChatModalHeader />,
      SearchBar: <SearchChatBar />,
      NoImageClan: <NoImageClan />,
      NoImageProfile: <NoImageProfile />,
      NoImageGroup: <NoImageGroup />,
    },
  },
  ServerTopNavigation: {
    Icons: {
      Sun: <Sun className="w-5 h-5 text-neon-blue" />,
      Moon: <Moon className="w-5 h-5 text-primary" />,
      Bell: (
        <Bell className="w-5 h-5 text-muted-foreground hover:text-neon-blue transition-colors" />
      ),
      Search: (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      ),
      MessageSquare: (
        <MessageSquare className="w-5 h-5 text-muted-foreground hover:text-neon-green transition-colors" />
      ),
      Menu: <Menu aria-hidden="true" className="w-6 h-6" />,
      Settings: (
        <Settings className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
      ),
      LogOut: (
        <LogOut className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
      ),
    },
  },
} as const;

export default function BaseLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseLayoutServerProvider components={BaseLayoutServerComponents}>
      {children}
    </BaseLayoutServerProvider>
  );
}
