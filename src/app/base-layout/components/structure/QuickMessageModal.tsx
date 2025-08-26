import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPriorityColorQuickMessagesConfig } from "../../utils/quickMessagesModalUtils";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";
import { QuickMessageModalProps } from "../../types/structure/QuickMessageModalProps";

export const QuickMessageModal = ({
  open,
  onOpenChange,
  message,
  onReply,
}: QuickMessageModalProps) => {
  const { BaseLayout } = useBaseLayoutServerContext();
  if (!message) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full bg-background/95 backdrop-blur-xl border border-primary/20">
        {
          BaseLayout.ServerQuickMessagesModal.components
            .QuickMessagesModalHeader
        }
        <div
          className={`rounded-xl p-6 bg-gradient-to-r from-primary-start/10 to-primary-end/10 ${getPriorityColorQuickMessagesConfig(
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
                {BaseLayout.ServerQuickMessagesModal.icons.Clock}
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
              {BaseLayout.ServerQuickMessagesModal.icons.Reply}
              Responder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
