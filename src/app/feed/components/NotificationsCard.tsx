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
  type: 'like' | 'comment' | 'follow' | 'mention';
}

// Import avatars
import avatarJames from "@/assets/avatar-raymond.jpg";
import avatarAlex from "@/assets/avatar-samuel.jpg";
import avatarSophia from "@/assets/avatar-sophia.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const notifications: Notification[] = [
  {
    id: '1',
    users: [
      { name: 'James', avatar: avatarJames }
    ],
    action: 'curtiu sua postagem',
    content: 'dsadsadsa',
    time: 'há alguns segundos',
    type: 'like'
  },
  {
    id: '2',
    users: [
      { name: 'Alex', avatar: avatarAlex },
      { name: 'Sophia', avatar: avatarSophia }
    ],
    action: 'responderam o seu comentário 3 vezes',
    content: 'COMENTÁRIO MEU',
    time: 'há 2 horas',
    type: 'comment'
  }
];

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like': return '❤️';
    case 'comment': return '👥';
    case 'follow': return '👤';
    case 'mention': return '@';
  }
};

export const NotificationsCard = () => {
  return (
        <Card className="bg-card border-border/50 backdrop-blur-sm animate-fade-up hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Notificações recentes</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div 
              key={notification.id}
              className="p-3 rounded-xl bg-better-contrast hover:bg-muted/50 hover:shadow-improved transition-all duration-200 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-3">
                {/* User Avatars */}
                <div className="flex -space-x-2">
                  {notification.users.slice(0, 3).map((user, userIndex) => (
                    <Avatar key={userIndex} className="w-8 h-8 border-2 border-background">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-primary text-white text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {notification.users.length > 3 && (
                    <div className="w-8 h-8 border-2 border-background bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">+{notification.users.length - 3}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground leading-relaxed">
                        <span className="font-medium">
                          {notification.users.map(u => u.name).join(', ')}
                        </span> {notification.action}
                      </p>
                      {notification.content && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          "{notification.content}"
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{notification.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};