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
      <DialogContent className="flex max-h-[min(85dvh,720px)] max-w-4xl flex-col gap-0 overflow-hidden p-4 sm:p-6 bg-background/95 backdrop-blur-xl border border-primary/20">
        {components.QuickMessagesHistoryModalHeader}

        <ScrollArea className="flex-1 min-h-0 pr-2 sm:pr-4">
          <div className="space-y-3 sm:space-y-4">
            {historyMessages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-3 sm:rounded-xl sm:p-4 border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                  message.status === "expired" ? "opacity-60" : ""
                } ${getPriorityConfig(message.priority).color}`}
                onClick={() => onMessageClick?.(message)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/30 sm:h-12 sm:w-12">
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

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:mb-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                        <h3 className="truncate font-bold text-foreground text-sm sm:text-base">
                          {message.user.name}
                        </h3>
                        <span className="truncate text-xs text-muted-foreground sm:text-sm">
                          @{message.user.username}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        {getStatusBadge(message.status).BadgeStatus}
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          {getPriorityConfig(message.priority).icon}
                        </div>
                      </div>
                    </div>

                    <p className="mb-2 text-sm leading-relaxed text-foreground sm:mb-3 sm:text-base">
                      {message.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
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
