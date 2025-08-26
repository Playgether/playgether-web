"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { ConversationsModal } from "../chat/ConversationsModal";
import { NotificationsModal } from "./NotificationsModal";
import { SettingsModal } from "../../SettingsModal";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";

export const TopNavigation = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationsOpen, setConversationsOpen] = useState(false);
  const { BaseLayout } = useBaseLayoutServerContext();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="fixed top-0 left-20 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-30 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          {BaseLayout.ServerTopNavigation.Icons.Search}
          <Input
            placeholder="Pesquisar"
            className="pl-12 h-11 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all duration-300"
          />
        </div>
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
          {isDarkMode
            ? BaseLayout.ServerTopNavigation.Icons.Sun
            : BaseLayout.ServerTopNavigation.Icons.Moon}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConversationsOpen(true)}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300 relative"
          aria-label="Open chat"
          title="Open chat"
        >
          {BaseLayout.ServerTopNavigation.Icons.MessageSquare}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-secondary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
            3
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsOpen(true)}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300 relative"
          aria-label="Open notifications"
          title="Open notifications"
        >
          {BaseLayout.ServerTopNavigation.Icons.Bell}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-primary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
            7
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300"
          aria-label="Open settings"
          title="Open settings"
        >
          {BaseLayout.ServerTopNavigation.Icons.Settings}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300"
          aria-label="Log out"
          title="Log out"
        >
          {BaseLayout.ServerTopNavigation.Icons.LogOut}
        </Button>
      </div>

      {/* Modals */}
      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ConversationsModal
        open={conversationsOpen}
        onOpenChange={setConversationsOpen}
      />
    </header>
  );
};
