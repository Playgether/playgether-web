import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";

import {
  getPriorityConfig,
  getStatusBadge,
} from "../../utils/quickMessagesHistoryModalUtils";
import { QuickMessage } from "../../types/structure/QuickMessage";

interface QuickMessagesHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageClick?: (message: any) => void;
  historyMessages: QuickMessage[];
}

interface HistoryMessage {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  status: "expired" | "active" | "responded";
}

// const historyMessages: HistoryMessage[] = [
//   {
//     id: "1",
//     user: {
//       name: "Sophia Andrade",
//       username: "sophia.andrade",
//       avatar: avatarSophia,
//     },
//     message: "Nova mensagem importante sobre o torneio de amanhã!",
//     timestamp: "há 5 minutos",
//     priority: "high",
//     status: "active",
//   },
//   {
//     id: "2",
//     user: {
//       name: "Aline Moreira",
//       username: "aline.moreira",
//       avatar: avatarAline,
//     },
//     message: "Alguém quer formar grupo para o raid de hoje?",
//     timestamp: "há 15 minutos",
//     priority: "medium",
//     status: "responded",
//   },
//   {
//     id: "3",
//     user: {
//       name: "Samuel Johnson",
//       username: "samuel.johnson",
//       avatar: avatarSamuel,
//     },
//     message: "Compartilhando dicas para o novo patch do jogo.",
//     timestamp: "há 1 hora",
//     priority: "low",
//     status: "expired",
//   },
//   {
//     id: "4",
//     user: { name: "Mia Santos", username: "mia.santos", avatar: avatarMia },
//     message: "Evento especial começando agora! Não percam!",
//     timestamp: "há 2 horas",
//     priority: "high",
//     status: "expired",
//   },
// ];

export const QuickMessagesHistoryModal = ({
  open,
  onOpenChange,
  onMessageClick,
  historyMessages,
}: QuickMessagesHistoryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] bg-background/95 backdrop-blur-xl border border-primary/20">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Histórico de Mensagens Rápidas
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {historyMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                  message.status === "expired" ? "opacity-60" : ""
                } ${getPriorityConfig(message.priority).color}`}
                onClick={() => onMessageClick?.(message)}
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                    <AvatarImage
                      src={message.user.avatar}
                      alt={message.user.name}
                    />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {message.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-foreground">
                          {message.user.name}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          @{message.user.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(message.status).BadgeStatus}
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          {getPriorityConfig(message.priority).icon}
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground mb-3 leading-relaxed">
                      {message.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{message.timestamp}</span>
                      </div>
                      {getPriorityConfig(message.priority).badge}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
