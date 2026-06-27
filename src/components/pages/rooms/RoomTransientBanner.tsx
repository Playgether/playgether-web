"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

type RoomTransientBannerProps = {
  message: string | null;
  /** Tempo visível antes de iniciar saída (ms). */
  durationMs?: number;
  variant?: "warning" | "destructive";
  className?: string;
  onDismiss?: () => void;
};

export function RoomTransientBanner({
  message,
  durationMs = 5000,
  variant = "warning",
  className,
  onDismiss,
}: RoomTransientBannerProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(Boolean(message));
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setDisplayMessage(message);
    setVisible(true);
    const hideTimer = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(hideTimer);
  }, [message, durationMs]);

  const styles =
    variant === "destructive"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100";

  return (
    <AnimatePresence mode="wait">
      {visible && displayMessage ? (
        <motion.div
          key={displayMessage}
          role="alert"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={(definition) => {
            if (definition === "exit") onDismiss?.();
          }}
          className={cn(
            "flex items-start justify-center gap-2 border px-3 py-2 text-center text-xs font-medium shadow-sm backdrop-blur-sm",
            styles,
            className,
          )}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-90" />
          <span className="leading-snug">{displayMessage}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
