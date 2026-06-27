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

export const TopNavigation = () => {
  const { logout } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const { resolvedTheme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const isDarkMode = themeMounted && resolvedTheme === "dark";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  return (
    <header className="fixed top-0 left-20 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-30 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <GlobalSearchDropdown />
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300"
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
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300 relative"
          aria-label="Open chat"
          title="Open chat"
        >
          {icons.MessageSquare}
          {dmUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-secondary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
              {dmUnreadCount > 99 ? "99+" : dmUnreadCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsOpen(true)}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300 relative"
          aria-label="Open notifications"
          title="Open notifications"
        >
          {icons.Bell}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-primary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300"
          aria-label="Open settings"
          title="Open settings"
        >
          {icons.Settings}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => logout()}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300"
          aria-label="Log out"
          title="Log out"
        >
          {icons.LogOut}
        </Button>
      </div>

      {/* Modals */}
      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
};
