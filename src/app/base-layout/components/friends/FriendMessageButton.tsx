"use client";

import { useCallback, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/services/directMessages";
import { useConversationsWidget } from "@/context/ConversationsWidgetContext";
import { CustomToast } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";

interface FriendMessageButtonProps {
  userId: string | number;
  onSuccess?: () => void;
  className?: string;
}

export function FriendMessageButton({
  userId,
  onSuccess,
  className,
}: FriendMessageButtonProps) {
  const { openWithConversation } = useConversationsWidget();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      try {
        const result = await startConversation(String(userId));
        if (!result.ok) {
          CustomToast.error(result.error, {
            duration: CustomToastProps.defaultDuration,
          });
          return;
        }
        openWithConversation(result.conversation.id);
        onSuccess?.();
      } finally {
        setLoading(false);
      }
    },
    [userId, loading, openWithConversation, onSuccess],
  );

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-8 w-8 shrink-0 text-muted-foreground hover:text-primary ${className ?? ""}`}
      onClick={handleClick}
      disabled={loading}
      title="Enviar mensagem"
      aria-label="Enviar mensagem"
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
}
