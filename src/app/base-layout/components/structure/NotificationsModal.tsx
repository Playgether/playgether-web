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
import { CheckCheck, Trash2, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";
import {
  useNotificationContext,
  type NotificationItem,
} from "@/context/NotificationsContext";
import { NotificationListItem } from "@/components/notifications/NotificationListItem";
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
  const router = useRouter();
  const { BaseLayout } = useBaseLayoutServerContext();
  const components = BaseLayout.ServerNotificationsModal.components;

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

        <ScrollArea className="h-[min(60dvh,420px)]">
          <div className="px-3 py-3 space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingComponent text="Carregando..." showText className="text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map((notification, index) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  index={index}
                  timeLabel={timeAgo(notification.timestamp)}
                  onMarkAsRead={handleMarkAsRead}
                  onClick={handleNotificationClick}
                  onDelete={(n) => void deleteNotification(n.id)}
                />
              ))
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
