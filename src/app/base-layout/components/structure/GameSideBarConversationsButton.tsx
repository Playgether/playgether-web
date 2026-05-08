"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GamerSideBarItensInterface } from "../../types/structure/GamerSideBarItensInterface";
import { ConversationsModal } from "../chat/ConversationsModal";
import { FriendsModal } from "../friends/FriendsModal";

export default function GamerSidbarConversationsButtons({
  item,
}: {
  item: GamerSideBarItensInterface;
}) {
  const [conversationsOpen, setConversationsOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (item.href) {
      router.push(item.href);
    } else if (item.action === "conversations") {
      setConversationsOpen(true);
    } else if (item.action === "friends") {
      setFriendsOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        type="button"
        aria-haspopup={item.action ? "dialog" : undefined}
        aria-expanded={
          item.action === "conversations"
            ? conversationsOpen
            : item.action === "friends"
            ? friendsOpen
            : undefined
        }
        aria-label={item.label}
        title={item.label}
        className={cn(
          "w-14 h-14 rounded-xl transition-all duration-300 relative",
          "hover:bg-white/20 hover:shadow-glow-neon hover:scale-105",
          item.active
            ? "bg-white/20 text-white shadow-glow-neon"
            : "text-white/80 hover:text-white"
        )}
      >
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
      <FriendsModal
        open={friendsOpen}
        onOpenChange={setFriendsOpen}
      />
    </>
  );
}
