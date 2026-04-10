"use client";
import { useLayoutEffect, useRef } from "react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { AnimatePresence, motion } from "framer-motion";
import { QuickMessagesHistoryModal } from "./QuickMessagesHistoryModal";
import { QuickMessageModal } from "./QuickMessageModal";
import {
  calculateAnimationDuration,
  getPriorityClass,
  getPriorityColor,
  needsAnimation,
} from "../../utils/quickMessagesUtils";
import { useQuickMessagesUI } from "../../hooks/useQuickMessagesUI";
import { quickMessages } from "../../mocks/mockQuickMessages";
import { useBaseLayoutServerContext } from "../../context/BaseLayoutServerContext";

/* -------------------- Component -------------------- */
export const QuickMessagesFooter = () => {
  const {
    activeMessages,
    fadingOutMessages,
    historyOpen,
    setHistoryOpen,
    selectedMessage,
    messageModalOpen,
    setMessageModalOpen,
    messageRefs,
    handleMessageClick,
    messageTimers,
    setSelectedMessage,
    historyMessages,
  } = useQuickMessagesUI(quickMessages);
  const { BaseLayout } = useBaseLayoutServerContext();
  const components = BaseLayout.ServerQuickMessagesFooter.components;
  const footerShellRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = footerShellRef.current;
    if (!el) return;
    const syncHeight = () => {
      const raw = el.getBoundingClientRect().height;
      // Evita 0px se o ref ainda não pintou (animação / Strict Mode)
      const h = Math.max(48, Math.ceil(raw || 0));
      document.documentElement.style.setProperty("--layout-quick-messages-height", `${h}px`);
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--layout-quick-messages-height");
    };
  }, [activeMessages.length]);

  if (activeMessages.length === 0) {
    return (
      <motion.div
        ref={footerShellRef}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-20 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50 p-4"
      >
        <div
          className="max-w-7xl mx-auto flex items-center hover:cursor-pointer"
          onClick={() => setHistoryOpen(true)}
        >
          {components.NoMessagesQuickMessages}
        </div>
        <QuickMessagesHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          onMessageClick={(message) => {
            setSelectedMessage(message);
            setMessageModalOpen(true);
            setHistoryOpen(false);
          }}
          historyMessages={historyMessages}
        />
        <QuickMessageModal
          open={messageModalOpen}
          onOpenChange={setMessageModalOpen}
          message={
            selectedMessage
              ? {
                  ...selectedMessage,
                  user: {
                    ...selectedMessage.user,
                    avatar:
                      typeof selectedMessage.user.avatar === "string"
                        ? selectedMessage.user.avatar
                        : selectedMessage.user.avatar.src,
                  },
                }
              : undefined
          }
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={footerShellRef}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-20 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50 p-4 mt-[120px]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {/* Title */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setHistoryOpen(true)}
        >
          {components.QuickMessagesFooterTitle}
        </div>

        {/* Messages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 overflow-hidden w-full pl-4 pr-4">
          <AnimatePresence mode="popLayout">
            {activeMessages.map((message, index) => {
              const el = messageRefs.current[message.id];
              const shouldAnimate = needsAnimation(el);
              const animationDuration = calculateAnimationDuration(el);

              return (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: fadingOutMessages.has(message.id) ? 0 : 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className={`flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-primary-start/10 to-primary-end/10 hover:shadow-improved cursor-pointer ${getPriorityClass(
                    message.priority
                  )}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <ProfileAvatar
                    displayName={message.user.name}
                    username={message.user.username}
                    profilePhoto={
                      typeof message.user.avatar === "string"
                        ? message.user.avatar
                        : message.user.avatar.src
                    }
                    sizeClass="h-10 w-10"
                    ringClass="ring-2 ring-primary/30"
                    className="flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-medium text-xs group-hover:text-primary/80 transition-all duration-300 cursor-pointer group truncate ${getPriorityColor(
                          message.priority
                        )}`}
                      >
                        {message.user.name}:
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full whitespace-nowrap">
                        {messageTimers[message.id] || 0}s
                      </span>
                    </div>

                    {/* Texto animado */}
                    <div className="relative overflow-hidden h-5">
                      {shouldAnimate ? (
                        <div className="relative w-full h-full overflow-hidden">
                          <motion.p
                            ref={(el) => (messageRefs.current[message.id] = el)}
                            className="text-sm text-foreground whitespace-nowrap"
                            animate={{ x: ["100%", "-100%"] }}
                            transition={{
                              repeat: Infinity,
                              duration: animationDuration * 2,
                              ease: "linear",
                              repeatDelay: 1,
                            }}
                          >
                            {message.message}
                          </motion.p>
                        </div>
                      ) : (
                        <p
                          ref={(el) => (messageRefs.current[message.id] = el)}
                          className="text-sm text-foreground whitespace-nowrap"
                        >
                          {message.message}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Modais */}
      <QuickMessagesHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onMessageClick={(message) => {
          setSelectedMessage(message);
          setMessageModalOpen(true);
          setHistoryOpen(false);
        }}
        historyMessages={historyMessages}
      />
      <QuickMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        message={
          selectedMessage
            ? {
                ...selectedMessage,
                user: {
                  ...selectedMessage.user,
                  avatar:
                    typeof selectedMessage.user.avatar === "string"
                      ? selectedMessage.user.avatar
                      : selectedMessage.user.avatar.src,
                },
              }
            : undefined
        }
      />
    </motion.div>
  );
};
