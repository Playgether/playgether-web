"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const isActive = item.href
    ? item.href === "/feed"
      ? pathname === "/feed"
      : pathname.startsWith(item.href)
    : false;

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
      <button
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
          "w-full h-14 flex items-center rounded-xl transition-all duration-300 relative",
          "hover:bg-white/20 hover:shadow-glow-neon hover:scale-[1.02]",
          isActive
            ? "bg-white/20 text-white shadow-glow-neon"
            : "text-white/80 hover:text-white"
        )}
      >
        {/* Ícone — container fixo w-14 para manter centralizado quando sidebar fechada */}
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center relative">
          <div
            className={cn(
              "flex items-center justify-center",
              item.rounded === "full"
                ? "w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-400/60 shadow-[0_0_10px_2px_rgba(168,85,247,0.35)] hover:ring-purple-300 hover:shadow-[0_0_16px_4px_rgba(168,85,247,0.55)]"
                : "w-6 h-6"
            )}
          >
            {item.icon}
          </div>
          {item.notifications && (
            <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-gradient-secondary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
              {item.notifications}
            </span>
          )}
        </div>

        {/* Label — desliza quando sidebar expande */}
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all delay-100 duration-300 group-hover/sidebar:max-w-xs group-hover/sidebar:opacity-100">
          {item.label}
        </span>
      </button>

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
