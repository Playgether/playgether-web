"use client";
import {
  Search,
  Bell,
  Settings,
  Moon,
  Sun,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { ConversationsModal } from "../chat/ConversationsModal";
import { NotificationsModal } from "./NotificationsModal";
import { SettingsModal } from "../../SettingsModal";

export const TopNavigation = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationsOpen, setConversationsOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="fixed top-0 left-20 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-30 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-neon-blue" />
          ) : (
            <Moon className="w-5 h-5 text-primary" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConversationsOpen(true)}
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300 relative"
          aria-label="Open chat"
          title="Open chat"
        >
          <MessageSquare className="w-5 h-5 text-muted-foreground hover:text-neon-green transition-colors" />
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
          <Bell className="w-5 h-5 text-muted-foreground hover:text-neon-blue transition-colors" />
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
          <Settings className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-11 h-11 rounded-xl hover:bg-muted/50 hover:shadow-glow-neon transition-all duration-300"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
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
