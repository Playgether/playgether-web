"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GamerSideBarItensInterface } from "../../types/structure/GamerSideBarItensInterface";
import { ConversationsModal } from "../chat/ConversationsModal";

export default function GamerSidbarConversationsButtons({
  item,
}: {
  item: GamerSideBarItensInterface;
}) {
  const [conversationsOpen, setConversationsOpen] = useState(false);

  const handleItemClick = (label: string) => {
    if (label === "Mensagens") {
      setConversationsOpen(true);
    }
  };
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleItemClick(item.label)}
        className={cn(
          "w-14 h-14 rounded-xl transition-all duration-300 relative",
          "hover:bg-white/20 hover:shadow-glow-neon hover:scale-105",
          item.active
            ? "bg-white/20 text-white shadow-glow-neon"
            : "text-white/80 hover:text-white"
        )}
      >
        {/* <item.icon className="w-6 h-6" /> */}
        {item.icon}
        {item.notifications && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-secondary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
            {item.notifications}
          </span>
        )}
      </Button>
      <ConversationsModal
        open={conversationsOpen}
        onOpenChange={setConversationsOpen}
      />
    </>
  );
}
