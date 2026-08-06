"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

import {
  getPriorityConfig,
  getStatusBadge,
} from "../../utils/quickMessagesHistoryModalUtils";
import { QuickMessage } from "../../types/structure/QuickMessage";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";

interface QuickMessagesHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageClick?: (message: QuickMessage) => void;
  onCreate?: () => void;
  historyMessages: QuickMessage[];
  loading?: boolean;
}

export const QuickMessagesHistoryModal = ({
  open,
  onOpenChange,
  onMessageClick,
  onCreate,
  historyMessages,
  loading = false,
}: QuickMessagesHistoryModalProps) => {
  const { BaseLayout } = useBaseLayoutServerContext();
  const components = BaseLayout.ServerQuickMessagesHistoryModal.components;
  const icons = BaseLayout.ServerQuickMessagesHistoryModal.icons;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(85dvh,720px)] max-w-4xl flex-col gap-0 overflow-hidden border border-primary/20 bg-background/95 p-4 backdrop-blur-xl sm:p-6">
        <div className="shrink-0 border-b border-border/50 pb-3 sm:pb-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0 flex-1">
              {components.QuickMessagesHistoryModalHeader}
            </div>
            {onCreate ? (
              <Button
                type="button"
                size="sm"
                onClick={onCreate}
                className="shrink-0 bg-gradient-primary text-white"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Criar
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 sm:mt-4 sm:pr-2">
          {loading && historyMessages.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando histórico…
            </div>
          ) : historyMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma mensagem no histórico ainda.
              </p>
              {onCreate ? (
                <Button
                  type="button"
                  onClick={onCreate}
                  className="bg-gradient-primary text-white"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Criar mensagem
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3 px-1 py-1.5 sm:space-y-4">
              {historyMessages.map((message) => (
                <div
                  key={message.id}
                  className={`cursor-pointer rounded-lg p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl sm:p-4 ${
                    message.status === "expired" ? "opacity-60" : ""
                  } ${getPriorityConfig(message.priority).color}`}
                  onClick={() => onMessageClick?.(message)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/30 sm:h-12 sm:w-12">
                      <AvatarImage
                        src={
                          typeof message.user.avatar === "string"
                            ? message.user.avatar
                            : message.user.avatar.src
                        }
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
                          <h3 className="truncate text-sm font-bold text-foreground sm:text-base">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
