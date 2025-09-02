import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";

export default function ContextMenuNotMine({ handleContextAction }) {
  const { Feed } = useFeedServerContext();
  const contextMenuOptions = Feed.ServerContextMenuOwn.components;
  return (
    <>
      <DropdownMenuItem
        onClick={() => handleContextAction("block")}
        className="flex items-center space-x-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
      >
        {contextMenuOptions.Block}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => handleContextAction("remove")}
        className="flex items-center space-x-2 hover:bg-muted/50"
      >
        {contextMenuOptions.Remove}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => handleContextAction("mute")}
        className="flex items-center space-x-2 hover:bg-muted/50"
      >
        {contextMenuOptions.MuteUser}
      </DropdownMenuItem>
    </>
  );
}
