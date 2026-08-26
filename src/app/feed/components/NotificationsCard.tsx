"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useFeedProfileCardHeight } from "../hooks/useFeedProfileCardHeight";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { cn } from "@/lib/utils";
import {
  useNotificationContext,
  type NotificationItem,
} from "@/context/NotificationsContext";
import { NotificationListItem } from "@/components/notifications/NotificationListItem";

export const NotificationsCard = () => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationContext();

  const profileCardHeightPx = useFeedProfileCardHeight();

  const handleMarkAsRead = (notification: NotificationItem) => {
    if (!notification.is_read) void markAsRead(notification.id);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.action_url) return;
    router.push(notification.action_url);
  };

  return (
    <Card
      className={cn(
        "bg-card border-border/50 backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300",
        "flex min-w-0 w-full flex-col overflow-hidden",
        profileCardHeightPx == null && "max-h-[min(70vh,28rem)]",
      )}
      style={
        profileCardHeightPx != null
          ? { maxHeight: profileCardHeightPx }
          : undefined
      }
    >
      <CardHeader className="shrink-0 space-y-0 p-4 pb-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <CardTitle className="min-w-0 truncate text-base font-bold leading-tight xl:text-lg">
            Notificações recentes
          </CardTitle>
          {notifications.length > 0 ? (
            <div className="flex shrink-0 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void markAllAsRead()}
                disabled={unreadCount === 0}
                title="Marcar todas como lidas"
                aria-label="Marcar todas como lidas"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void clearAll()}
                title="Excluir todas"
                aria-label="Excluir todas"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 pb-3 pt-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação encontrada
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              index={index}
              timeLabel={<DateAndHour date={new Date(notification.timestamp)} />}
              onMarkAsRead={handleMarkAsRead}
              onClick={handleNotificationClick}
              onDelete={(n) => void deleteNotification(n.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
