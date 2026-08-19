"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Swords, X, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useRouter } from "next/navigation";
import { useFeedProfileCardHeight } from "../hooks/useFeedProfileCardHeight";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { cn } from "@/lib/utils";
import {
  useNotificationContext,
  type NotificationItem,
} from "@/context/NotificationsContext";
import { NotificationMessageText } from "@/app/base-layout/config/notifications/NotificationMessageText";

function isDuoNotification(notification: NotificationItem) {
  return (
    notification.notification_type === "duo" ||
    notification.actors[0]?.username === "duo"
  );
}

function NotificationMessage({
  notification,
  isDuo,
}: {
  notification: NotificationItem;
  isDuo: boolean;
}) {
  if (isDuo) {
    return (
      <p className="text-sm leading-snug text-foreground break-words">
        <span className="font-semibold text-primary">Duo</span>{" "}
        {notification.message}
      </p>
    );
  }

  const colonIndex = notification.message.indexOf(":");
  if (colonIndex === -1) {
    return (
      <p className="text-sm leading-snug text-foreground break-words">
        <NotificationMessageText text={notification.message} />
      </p>
    );
  }

  const title = notification.message.slice(0, colonIndex).trim();
  const extra = notification.message.slice(colonIndex + 1).trim();

  return (
    <>
      <p className="text-sm leading-snug text-foreground break-words">
        <NotificationMessageText text={title} />
      </p>
      {extra ? (
        <p className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">
          {extra}
        </p>
      ) : null}
    </>
  );
}

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
          notifications.map((notification, index) => {
            const isDuo = isDuoNotification(notification);
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
                  if (
                    clickable &&
                    (e.key === "Enter" || e.key === " ") &&
                    notification.action_url
                  ) {
                    e.preventDefault();
                    handleNotificationClick(notification);
                  }
                }}
                className={cn(
                  "group flex min-w-0 items-start gap-2.5 rounded-xl p-2.5 transition-all duration-200 animate-slide-up",
                  clickable ? "cursor-pointer" : "cursor-default",
                  notification.is_read
                    ? "bg-better-contrast hover:bg-muted/50"
                    : "border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/15 hover:to-secondary/15",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative shrink-0">
                  {isDuo ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-background bg-gradient-primary ring-1 ring-background">
                      <Swords className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex -space-x-2">
                      {notification.actors.map((actor, userIndex) => (
                        <ProfileAvatar
                          key={`${actor.username}-${userIndex}`}
                          displayName={actor.name}
                          username={actor.username}
                          profilePhoto={actor.profile_photo ?? null}
                          sizeClass="h-8 w-8"
                          className="border border-background ring-1 ring-background"
                          fallbackTextClassName="text-xs"
                        />
                      ))}
                    </div>
                  )}
                  {!notification.is_read ? (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gradient-primary animate-glow-pulse" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <NotificationMessage
                    notification={notification}
                    isDuo={isDuo}
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    <DateAndHour date={new Date(notification.timestamp)} />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteNotification(notification.id);
                  }}
                  aria-label="Excluir notificação"
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
