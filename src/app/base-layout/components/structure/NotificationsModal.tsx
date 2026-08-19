"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, CheckCheck, Trash2, Bell, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { notificationConfig } from "../../config/notifications/NotificationConfig";
import { NotificationMessageText } from "../../config/notifications/NotificationMessageText";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";
import {
  useNotificationContext,
  type NotificationItem,
} from "@/context/NotificationsContext";
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

function isDuoNotification(notification: NotificationItem) {
  return (
    notification.notification_type === "duo" ||
    notification.actors[0]?.username === "duo"
  );
}

export const NotificationsModal = ({
  open,
  onOpenChange,
}: NotificationsModalProps) => {
  const router = useRouter();
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

  const pendingHrefRef = useRef<string | null>(null);

  const navigateTo = (href: string) => {
    if (pendingHrefRef.current !== href) return;
    pendingHrefRef.current = null;
    router.push(href);
  };

  const handleMarkAsRead = (notification: NotificationItem) => {
    if (!notification.is_read) void markAsRead(notification.id);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    const href = notification.action_url;
    if (!href) return;
    pendingHrefRef.current = href;
    onOpenChange(false);
    window.setTimeout(() => navigateTo(href), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md w-[calc(100%-1.5rem)] sm:w-full min-w-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-primary/20 shadow-glow-primary p-0 gap-0"
        onCloseAutoFocus={(e) => {
          const href = pendingHrefRef.current;
          if (!href) return;
          e.preventDefault();
          navigateTo(href);
        }}
      >
        {/* Header */}
        <DialogHeader className="px-4 sm:px-5 pt-5 pb-3 pr-12 border-b border-border/50 text-left">
          <DialogTitle className="text-lg sm:text-xl font-bold flex min-w-0 items-center gap-2">
            {components.NotificationsTitle}
            {unreadCount > 0 ? (
              <span className="ml-1 shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-primary text-white animate-glow-pulse">
                {unreadCount}
              </span>
            ) : null}
          </DialogTitle>

          {notifications.length > 0 ? (
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="h-8 min-w-0 flex-1 sm:flex-none px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Marcar todas como lidas</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 min-w-0 flex-1 sm:flex-none px-2 text-xs text-muted-foreground hover:text-destructive gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Excluir todas</span>
              </Button>
            </div>
          ) : null}
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="h-[min(60dvh,420px)]">
          <div className="px-3 py-3 space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingComponent text="Carregando..." showText className="text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map((notification, index) => {
                const isDuo = isDuoNotification(notification);
                const actor = isDuo ? null : notification.actors[0];
                const typeKey = isDuo ? "duo" : notification.notification_type;
                const typeIcon =
                  notificationConfig[typeKey]?.icon ??
                  notificationConfig["default"].icon;
                const clickable = Boolean(notification.action_url);

                return (
                  <div
                    key={notification.id}
                    role={clickable ? "link" : "button"}
                    tabIndex={0}
                    onPointerEnter={() => handleMarkAsRead(notification)}
                    onFocus={() => handleMarkAsRead(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNotificationClick(notification);
                      }
                    }}
                    className={`flex min-w-0 items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-300 group animate-slide-up
                      ${clickable ? "cursor-pointer" : "cursor-default"}
                      ${notification.is_read
                        ? "bg-muted/50 hover:bg-muted/70"
                        : "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 hover:from-primary/15 hover:to-secondary/15"
                      }`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* Avatar + type icon */}
                    <div className="relative shrink-0">
                      {isDuo ? (
                        <div className="w-10 h-10 rounded-full ring-2 ring-primary/30 bg-gradient-primary flex items-center justify-center">
                          <Swords className="w-5 h-5 text-white" />
                        </div>
                      ) : actor ? (
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
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm text-foreground leading-snug break-words">
                        {isDuo ? (
                          <span className="font-semibold text-primary">Duo </span>
                        ) : actor ? (
                          <span className="font-semibold text-primary">
                            {actor.name}{" "}
                          </span>
                        ) : null}
                        <NotificationMessageText text={notification.message} />
                      </p>
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {timeAgo(notification.timestamp)}
                      </span>
                    </div>

                    {/* Right: unread dot + delete */}
                    <div className="flex shrink-0 flex-col items-center gap-2">
                      {!notification.is_read ? (
                        <div className="w-2 h-2 bg-gradient-primary rounded-full animate-glow-pulse" />
                      ) : (
                        <div className="h-2 w-2" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteNotification(notification.id);
                        }}
                        aria-label="Excluir notificação"
                        className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
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
      <div className="p-4 rounded-2xl bg-muted/60">
        <Bell className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada</p>
    </div>
  );
}
