"use client";

import { Megaphone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { QuickMessage } from "../../types/structure/QuickMessage";
import { getPriorityClass, getPriorityColor } from "../../utils/quickMessagesUtils";

type MobileQuickMessageTickerProps = {
  message: QuickMessage | undefined;
  messageTimer: number;
  isFadingOut: boolean;
  onOpenHistory: () => void;
};

export function MobileQuickMessageTicker({
  message,
  messageTimer,
  isFadingOut,
  onOpenHistory,
}: MobileQuickMessageTickerProps) {
  if (!message) return null;

  return (
    <button
      type="button"
      onClick={onOpenHistory}
      className={`relative flex w-full items-center gap-2 overflow-hidden px-3 py-2 lg:hidden ${getPriorityClass(
        message.priority
      )}`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-secondary">
        <Megaphone className="h-3.5 w-3.5 text-white" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!isFadingOut && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <ProfileAvatar
              displayName={message.user.name}
              username={message.user.username}
              profilePhoto={
                typeof message.user.avatar === "string"
                  ? message.user.avatar
                  : message.user.avatar.src
              }
              sizeClass="h-6 w-6"
              ringClass="ring-1 ring-primary/30"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1 text-left">
              <p
                className={`truncate text-xs font-medium ${getPriorityColor(
                  message.priority
                )}`}
              >
                {message.user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {message.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="shrink-0 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
        {messageTimer}s
      </span>
    </button>
  );
}
