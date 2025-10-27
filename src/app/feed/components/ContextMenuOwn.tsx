import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";

export default function ContextMenuOwn({ handleContextAction }) {
  const { Feed } = useFeedServerContext();
  const contextMenuOptions = Feed.ServerContextMenuOwn.components;
  return (
    <>
      <DropdownMenuItem
        onClick={() => handleContextAction("delete")}
        className="flex items-center space-x-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
      >
        {contextMenuOptions.Delete}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => handleContextAction("pin")}
        className="flex items-center space-x-2 hover:bg-muted/50"
      >
        {contextMenuOptions.Pin}
      </DropdownMenuItem>
    </>
  );
}
