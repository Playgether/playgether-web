"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuthContext } from "@/context/AuthContext";
import { useNotificationContext } from "@/context/NotificationsContext";
import { NotificationsModal } from "./NotificationsModal";
import { SettingsModal } from "../../SettingsModal";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";
import { useRouter } from "next/navigation";
import { useDMUnread } from "@/context/DMUnreadContext";
import { GlobalSearchDropdown } from "./GlobalSearchDropdown";
import { FriendsModal } from "../friends/FriendsModal";
import { Users, MessageSquarePlus } from "lucide-react";
import { FeedbackDialog } from "../feedback/FeedbackDialog";

export const TopNavigation = () => {
  const { logout } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const isDarkMode = themeMounted && resolvedTheme === "dark";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { BaseLayout } = useBaseLayoutServerContext();
  const router = useRouter();
  const icons = BaseLayout?.ServerTopNavigation.icons;
  const { unreadCount: dmUnreadCount } = useDMUnread();

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const actionBtn =
    "h-9 w-9 rounded-xl transition-all duration-300 hover:bg-muted/50 hover:shadow-glow-neon sm:h-10 sm:w-10 lg:h-11 lg:w-11";

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/50 bg-background/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-4 lg:left-20 lg:h-16 lg:px-6">
      <div className="min-w-0 flex-1 lg:max-w-xl">
        <GlobalSearchDropdown onOpenChange={setSearchOpen} />
      </div>

      <div
        className={`flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3 ${
          searchOpen ? "max-sm:hidden" : ""
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className={actionBtn}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? icons.Sun : icons.Moon}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/conversations")}
          className={`${actionBtn} relative`}
          aria-label="Open chat"
          title="Open chat"
        >
          {icons.MessageSquare}
          {dmUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-secondary text-[10px] font-bold text-white animate-glow-pulse sm:h-5 sm:w-5 sm:text-xs">
              {dmUnreadCount > 99 ? "99+" : dmUnreadCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFriendsOpen(true)}
          className={`${actionBtn} lg:hidden`}
          aria-label="Amigos"
          title="Amigos"
        >
          <Users className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsOpen(true)}
          className={`${actionBtn} relative`}
          aria-label="Open notifications"
          title="Open notifications"
        >
          {icons.Bell}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-bold text-white animate-glow-pulse sm:h-5 sm:w-5 sm:text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>

        {/* Feedback — visível só no mobile (desktop usa sidebar) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFeedbackOpen(true)}
          className={`${actionBtn} lg:hidden`}
          aria-label="Enviar feedback"
          title="Enviar feedback"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className={actionBtn}
          aria-label="Open settings"
          title="Open settings"
        >
          {icons.Settings}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => logout()}
          className={actionBtn}
          aria-label="Log out"
          title="Log out"
        >
          {icons.LogOut}
        </Button>
      </div>

      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FriendsModal open={friendsOpen} onOpenChange={setFriendsOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </header>
  );
};
