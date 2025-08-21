import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Reply, Clock } from "lucide-react";

interface QuickMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: {
    id: string;
    user: {
      name: string;
      username?: string;
      avatar: string;
    };
    message: string;
    timeRemaining: string;
    priority: "high" | "medium" | "low";
    fullContent?: string;
  };
  onReply?: () => void;
}

export const QuickMessageModal = ({
  open,
  onOpenChange,
  message,
  onReply,
}: QuickMessageModalProps) => {
  if (!message) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-neon-purple/80 shadow-glow-neon";
      case "medium":
        return "border-neon-blue/60 shadow-glow-primary/30";
      default:
        return "border-border";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full bg-background/95 backdrop-blur-xl border border-primary/20">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Mensagem Rápida
          </DialogTitle>
        </DialogHeader>

        <div
          className={`rounded-xl p-6 bg-gradient-to-r from-primary-start/10 to-primary-end/10 ${getPriorityColor(
            message.priority
          )}`}
        >
          {/* Message Header */}
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-primary/30">
              <AvatarImage src={message.user.avatar} alt={message.user.name} />
              <AvatarFallback className="bg-gradient-primary text-white text-lg">
                {message.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">
                {message.user.name}
              </h3>
              {message.user.username && (
                <p className="text-sm text-muted-foreground">
                  @{message.user.username}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Tempo restante: {message.timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-6">
            <ScrollArea className="max-h-96">
              <div className="pr-4">
                <p className="text-foreground leading-relaxed">
                  {message.fullContent || message.message}
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/50 hover:border-primary/50"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                onReply?.();
                onOpenChange(false);
              }}
              className="bg-gradient-primary hover:shadow-glow-primary/30 text-white"
            >
              <Reply className="w-4 h-4 mr-2" />
              Responder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
