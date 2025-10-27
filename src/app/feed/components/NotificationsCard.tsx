"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  users: {
    name: string;
    avatar: string;
  }[];
  action: string;
  content?: string;
  time: string;
  type: "like" | "comment" | "follow" | "mention";
}

// Import avatars
import avatarJames from "@/assets/avatar-raymond.jpg";
import avatarAlex from "@/assets/avatar-samuel.jpg";
import avatarSophia from "@/assets/avatar-sophia.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotifications } from "../hooks/useNotificationsWebSocket";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { NotificationProps } from "../types/NotificationProps";

const notifications: Notification[] = [
  {
    id: "1",
    users: [{ name: "James", avatar: avatarJames }],
    action: "curtiu sua postagem",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    time: "há alguns segundos",
    type: "like",
  },
  {
    id: "2",
    users: [
      { name: "Alex", avatar: avatarAlex },
      { name: "Sophia", avatar: avatarSophia },
    ],
    action: "responderam o seu comentário 3 vezes",
    content: "COMENTÁRIO MEU",
    time: "há 2 horas",
    type: "comment",
  },
];

const getTypeIcon = (type: Notification["type"]) => {
  switch (type) {
    case "like":
      return "❤️";
    case "comment":
      return "👥";
    case "follow":
      return "👤";
    case "mention":
      return "@";
  }
};

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
  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-4">
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

      <CardContent className="space-y-4">
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
                className="p-3 rounded-xl bg-better-contrast hover:bg-muted/50 hover:shadow-improved transition-all duration-200 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-start space-x-3">
                  {/* User Avatars */}
                  <div className="w-full flex justify-between">
                    <div className="flex -space-x-2">
                      {notification.actors.map((user, userIndex) => (
                        <Avatar
                          key={userIndex}
                          className="w-8 h-8 border-2 border-background"
                        >
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-primary text-white text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        // <div className="w-8 h-8 border-2 border-background" key={notification.id}>
                        //   {notification.profile_photo ? (
                        //     <div className="relative w-full h-full">
                        //       <Image
                        //         src={getCloudinaryUrl(post.profile_photo)}
                        //         alt={`Profile photo of the user ${post?.username}`}
                        //         fill
                        //         className="object-cover rounded-full"
                        //       />
                        //     </div>
                        //   ) : (
                        //     components.NoImageProfile
                        //   )}
                        // </div>
                      ))}
                      {/* {notification.users.length > 3 && (
                      <div className="w-8 h-8 border-2 border-background bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          +{notification.users.length - 3}
                        </span>
                      </div>
                    )} */}
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
