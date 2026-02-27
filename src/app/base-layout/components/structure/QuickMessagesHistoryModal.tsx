import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  getPriorityConfig,
  getStatusBadge,
} from "../../utils/quickMessagesHistoryModalUtils";
import { QuickMessage } from "../../types/structure/QuickMessage";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";

interface QuickMessagesHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageClick?: (message: any) => void;
  historyMessages: QuickMessage[];
}

export const QuickMessagesHistoryModal = ({
  open,
  onOpenChange,
  onMessageClick,
  historyMessages,
}: QuickMessagesHistoryModalProps) => {
  const { BaseLayout } = useBaseLayoutServerContext();
  const components = BaseLayout.ServerQuickMessagesHistoryModal.components;
  const icons = BaseLayout.ServerQuickMessagesHistoryModal.icons;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] bg-background/95 backdrop-blur-xl border border-primary/20">
        {components.QuickMessagesHistoryModalHeader}

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
                      src={typeof message.user.avatar === 'string' ? message.user.avatar : message.user.avatar.src}
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
                        {icons.Clock}
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
