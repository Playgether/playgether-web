import { AtSign, Heart, MessageCircle, UserPlus, Trophy, Bell, Swords } from "lucide-react";

export interface NotificationConfig {
  icon: JSX.Element;
}
export const notificationConfig: Record<string, NotificationConfig> = {
  like: {
    icon: <Heart className="w-4 h-4 text-neon-pink" />,
  },
  comment: {
    icon: <MessageCircle className="w-4 h-4 text-neon-blue" />,
  },
  follow: {
    icon: <UserPlus className="w-4 h-4 text-neon-green" />,
  },
  mention: {
    icon: <AtSign className="w-4 h-4 text-neon-blue" />,
  },
  achievement: {
    icon: <Trophy className="w-4 h-4 text-secondary-start" />,
  },
  duo: {
    icon: <Swords className="w-4 h-4 text-primary" />,
  },
  default: {
    icon: <Bell className="w-4 h-4" />,
  },
};
