"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useNotifications } from "../hooks/useNotificationsWebSocket";
import { useFeedProfileCardHeight } from "../hooks/useFeedProfileCardHeight";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { NotificationProps } from "../types/NotificationProps";
import { cn } from "@/lib/utils";

export const NotificationsCard = ({
  notificationsList,
}: {
  notificationsList: NotificationProps[];
}) => {
  const { notifications } = useNotifications({
    onNewNotification: (notification) => {
      console.log("Nova notificação:", notification);
    },
    onNotificationRemoved: (notification) => {
      console.log("Notificação removida:", notification);
    },
    notificationsList: notificationsList,
  });

  const profileCardHeightPx = useFeedProfileCardHeight();

  return (
    <Card
      className={cn(
        "bg-card border-border/50 backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300",
        "flex flex-col overflow-hidden",
        profileCardHeightPx == null && "max-h-[min(70vh,28rem)]",
      )}
      style={
        profileCardHeightPx != null
          ? { maxHeight: profileCardHeightPx }
          : undefined
      }
    >
      <CardHeader className="shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            Notificações recentes
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-5">
        <>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação encontrada
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-xl bg-better-contrast hover:bg-muted/50 hover:shadow-improved transition-all duration-200 cursor-pointer group animate-slide-up",
                  index === 0 && "mt-2",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-start space-x-3">
                  {/* User Avatars */}
                  <div className="w-full flex justify-between">
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
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      <DateAndHour date={notification.timestamp} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-medium">
                            {/* {notification.actors.map((u) => u.name).join(", ")} */}
                            {/* {notification.actors.map((actor) => (
                              <p>{actor.name}</p>
                            ))} */}
                          </span>{" "}
                          {notification.message.includes(":")
                            ? notification.message.split(":")[0].trim()
                            : notification.message}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground max-w-[200px] mt-1 truncate">
                            {(() => {
                              const parts = notification.message.split(":");
                              if (parts.length > 1) {
                                // Retorna tudo após o primeiro ":" e remove espaços em branco
                                return parts.slice(1).join(":").trim();
                              }
                              // return notification.message;
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      </CardContent>
    </Card>
  );
};
