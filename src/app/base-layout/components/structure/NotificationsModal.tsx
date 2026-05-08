"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, CheckCheck, Trash2, Bell } from "lucide-react";
import { notificationConfig } from "../../config/notifications/NotificationConfig";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";
import { useNotificationContext } from "@/context/NotificationsContext";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function timeAgo(timestamp: string) {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return "";
  }
}

export const NotificationsModal = ({
  open,
  onOpenChange,
}: NotificationsModalProps) => {
  const { BaseLayout } = useBaseLayoutServerContext();
  const components = BaseLayout.ServerNotificationsModal.components;
  const icons = BaseLayout.ServerNotificationsModal.icons;

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border border-primary/20 shadow-glow-primary p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {components.NotificationsTitle}
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-primary text-white animate-glow-pulse">
                {unreadCount}
              </span>
            )}
          </DialogTitle>

          {notifications.length > 0 && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas como lidas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir todas
              </Button>
            </div>
          )}
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[420px]">
          <div className="px-3 py-3 space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingComponent text="Carregando..." showText className="text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map((notification, index) => {
                const actor = notification.actors[0];
                const typeIcon =
                  notificationConfig[notification.notification_type]?.icon ??
                  notificationConfig["default"].icon;

                return (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!notification.is_read) void markAsRead(notification.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !notification.is_read)
                        void markAsRead(notification.id);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer group animate-slide-up
                      ${notification.is_read
                        ? "bg-muted/20 hover:bg-muted/40"
                        : "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 hover:from-primary/15 hover:to-secondary/15"
                      }`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* Avatar + type icon */}
                    <div className="relative shrink-0">
                      {actor ? (
                        <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                          <AvatarImage src={actor.profile_photo ?? undefined} alt={actor.name} />
                          <AvatarFallback className="bg-gradient-primary text-white text-sm">
                            {actor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        icons.Star
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border">
                        {typeIcon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {actor && (
                          <span className="font-semibold text-primary">
                            {actor.name}{" "}
                          </span>
                        )}
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {timeAgo(notification.timestamp)}
                      </span>
                    </div>

                    {/* Right: unread dot + delete */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-gradient-primary rounded-full animate-glow-pulse" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteNotification(notification.id);
                        }}
                        aria-label="Excluir notificação"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive text-muted-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <div className="p-4 rounded-2xl bg-muted/40">
        <Bell className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada</p>
    </div>
  );
}
