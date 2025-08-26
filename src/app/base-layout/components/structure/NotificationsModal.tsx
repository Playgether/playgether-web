"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// Import avatars
import avatarSamuel from "@/assets/avatar-samuel.jpg";
import avatarMia from "@/assets/avatar-mia.jpg";
import avatarSophia from "@/assets/avatar-sophia.jpg";
import { notificationConfig } from "../../config/notifications/NotificationConfig";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notifications = [
  {
    id: "1",
    type: "like",
    user: { name: "Samuel Johnson", avatar: avatarSamuel },
    message: "curtiu seu post sobre Apex Legends",
    time: "2 min",
    unread: true,
  },
  {
    id: "2",
    type: "comment",
    user: { name: "Mia Thompson", avatar: avatarMia },
    message: "comentou em seu post",
    time: "15 min",
    unread: true,
  },
  {
    id: "3",
    type: "follow",
    user: { name: "Sophia Andrade", avatar: avatarSophia },
    message: "começou a seguir você",
    time: "1h",
    unread: false,
  },
  {
    id: "4",
    type: "achievement",
    user: null,
    message: 'Você desbloqueou a conquista "Master Gamer"',
    time: "2h",
    unread: false,
  },
];

const getNotificationIcon = (type: string) => {
  return notificationConfig[type]?.icon || notificationConfig["default"].icon;
};

export const NotificationsModal = ({
  open,
  onOpenChange,
}: NotificationsModalProps) => {
  const { BaseLayout } = useBaseLayoutServerContext();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border border-primary/20 shadow-glow-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            {BaseLayout.ServerNotificationsModal.components.NotificationsTitle}
            <Badge
              variant="secondary"
              className="ml-auto bg-gradient-secondary text-white"
            >
              {notifications.filter((n) => n.unread).length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-muted/50 ${
                notification.unread
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30"
                  : "bg-muted/20"
              } animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                {notification.user ? (
                  <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                    <AvatarImage
                      src={notification.user.avatar}
                      alt={notification.user.name}
                    />
                    <AvatarFallback className="bg-gradient-primary text-white text-sm">
                      {notification.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  BaseLayout.ServerNotificationsModal.icons.Star
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-primary">
                      {notification.user?.name || "Sistema"}
                    </span>{" "}
                    {notification.message}
                  </p>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-gradient-primary rounded-full animate-glow-pulse" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
