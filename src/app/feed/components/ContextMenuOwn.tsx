import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";
import { MessageCircle, MessageCircleOff } from "lucide-react";

export default function ContextMenuOwn({
  handleContextAction,
  commentsDisabled = false,
}: {
  handleContextAction: (action: string) => void;
  commentsDisabled?: boolean;
}) {
  const { Feed } = useFeedServerContext();
  const contextMenuOptions = Feed.ServerContextMenuOwn.components;
  return (
    <>
      <DropdownMenuItem
        onClick={() => handleContextAction("toggle_comments")}
        className="flex items-center space-x-2 hover:bg-muted/50"
      >
        {commentsDisabled ? (
          <>
            <MessageCircle className="w-4 h-4 mr-2" />
            Ligar comentários
          </>
        ) : (
          <>
            <MessageCircleOff className="w-4 h-4 mr-2" />
            Desligar comentários
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => handleContextAction("delete")}
        className="flex items-center space-x-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
      >
        {contextMenuOptions.Delete}
      </DropdownMenuItem>
    </>
  );
}
