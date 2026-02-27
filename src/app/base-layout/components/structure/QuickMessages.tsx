import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { StaticImageData } from "next/image";

// Import avatars
import avatarSophia from "@/assets/avatar-sophia.jpg";
import avatarAline from "@/assets/avatar-aline.jpg";

interface QuickMessage {
  id: string;
  user: {
    name: string;
    avatar: StaticImageData | string;
  };
  message: string;
  timeRemaining: string;
}

const quickMessages: QuickMessage[] = [
  {
    id: "1",
    user: {
      name: "Sophia Andrade",
      avatar: avatarSophia,
    },
    message: "Nova mensagem (10 segundos)",
    timeRemaining: "0.0s",
  },
  {
    id: "2",
    user: {
      name: "Sophia Andrade",
      avatar: avatarSophia,
    },
    message: "Quinta mensagem (10 segundos)",
    timeRemaining: "0.0s",
  },
  {
    id: "3",
    user: {
      name: "Aline Moreira",
      avatar: avatarAline,
    },
    message: "Quarta mensagem (10 segundos)",
    timeRemaining: "0.0s",
  },
];

export const QuickMessages = () => {
  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm animate-fade-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <span>Mensagens Rápidas</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {quickMessages.map((message, index) => (
          <div
            key={message.id}
            className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-primary-start/10 to-primary-end/10 border border-primary/20 hover:shadow-glow-primary/20 transition-all duration-300 cursor-pointer group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Avatar className="w-10 h-10 ring-2 ring-primary/30">
              <AvatarImage src={typeof message.user.avatar === 'string' ? message.user.avatar : message.user.avatar.src} alt={message.user.name} />
              <AvatarFallback className="bg-gradient-primary text-white text-sm">
                {message.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-primary group-hover:text-primary/80 transition-colors">
                  {message.user.name}:
                </span>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  Tempo restante: {message.timeRemaining}
                </span>
              </div>
              <p className="text-sm text-foreground">{message.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
