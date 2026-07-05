"use client";
import { useLayoutEffect, useRef } from "react";
import { Megaphone } from "lucide-react";
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
import { MobileQuickMessageTicker } from "./MobileQuickMessageTicker";
import { useIsLgDesktop } from "@/hooks/use-lg-desktop";

const footerPositionClass =
  "fixed bottom-[var(--layout-bottom-nav-height)] left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-xl lg:bottom-0 lg:left-20";

function QuickMessagesModals({
  historyOpen,
  setHistoryOpen,
  messageModalOpen,
  setMessageModalOpen,
  selectedMessage,
  setSelectedMessage,
  historyMessages,
}: {
  historyOpen: boolean;
  setHistoryOpen: (v: boolean) => void;
  messageModalOpen: boolean;
  setMessageModalOpen: (v: boolean) => void;
  selectedMessage: ReturnType<typeof useQuickMessagesUI>["selectedMessage"];
  setSelectedMessage: ReturnType<typeof useQuickMessagesUI>["setSelectedMessage"];
  historyMessages: ReturnType<typeof useQuickMessagesUI>["historyMessages"];
}) {
  const normalizedMessage = selectedMessage
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
    : undefined;

  return (
    <>
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
        message={normalizedMessage}
      />
    </>
  );
}

export const QuickMessagesFooter = () => {
  const isLgDesktop = useIsLgDesktop();
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
  } = useQuickMessagesUI(quickMessages, isLgDesktop ? 3 : 1);
  const { BaseLayout } = useBaseLayoutServerContext();
  const components = BaseLayout.ServerQuickMessagesFooter.components;
  const footerShellRef = useRef<HTMLDivElement | null>(null);

  const mobileMessage = activeMessages[0];
  const mobileTimer = mobileMessage
    ? (messageTimers[mobileMessage.id] ?? 0)
    : 0;
  const mobileFading = mobileMessage
    ? fadingOutMessages.has(mobileMessage.id)
    : false;

  useLayoutEffect(() => {
    const el = footerShellRef.current;
    if (!el) return;
    const syncHeight = () => {
      const raw = el.getBoundingClientRect().height;
      const h = Math.max(40, Math.ceil(raw || 0));
      document.documentElement.style.setProperty(
        "--layout-quick-messages-height",
        `${h}px`
      );
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
        className={footerPositionClass}
      >
        {/* Mobile — faixa compacta */}
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="flex w-full items-center gap-2 px-3 py-2.5 lg:hidden"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-secondary">
            <Megaphone className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="truncate text-xs text-muted-foreground">
            Alto-falante · sem mensagens ativas
          </span>
        </button>

        {/* Desktop */}
        <div
          className="hidden cursor-pointer items-center p-4 lg:flex"
          onClick={() => setHistoryOpen(true)}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center">
            {components.NoMessagesQuickMessages}
          </div>
        </div>

        <QuickMessagesModals
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          messageModalOpen={messageModalOpen}
          setMessageModalOpen={setMessageModalOpen}
          selectedMessage={selectedMessage}
          setSelectedMessage={setSelectedMessage}
          historyMessages={historyMessages}
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
      className={footerPositionClass}
    >
      {/* Mobile — uma mensagem por vez, timer completo */}
      <MobileQuickMessageTicker
        message={mobileMessage}
        messageTimer={mobileTimer}
        isFadingOut={mobileFading}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      {/* Desktop — layout original */}
      <div className="hidden lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center p-4">
          <div
            className="flex cursor-pointer items-center space-x-2"
            onClick={() => setHistoryOpen(true)}
          >
            {components.QuickMessagesFooterTitle}
          </div>

          <div className="grid w-full grid-cols-1 gap-5 overflow-hidden pl-4 pr-4 md:grid-cols-3">
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
                    className={`flex cursor-pointer items-center space-x-3 rounded-xl bg-gradient-to-r from-primary-start/10 to-primary-end/10 p-4 hover:shadow-improved ${getPriorityClass(
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

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={`group cursor-pointer truncate text-xs font-medium transition-all duration-300 group-hover:text-primary/80 ${getPriorityColor(
                            message.priority
                          )}`}
                        >
                          {message.user.name}:
                        </span>
                        <span className="whitespace-nowrap rounded-full bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                          {messageTimers[message.id] || 0}s
                        </span>
                      </div>

                      <div className="relative h-5 overflow-hidden">
                        {shouldAnimate ? (
                          <div className="relative h-full w-full overflow-hidden">
                            <motion.p
                              ref={(node) => {
                                messageRefs.current[message.id] = node;
                              }}
                              className="whitespace-nowrap text-sm text-foreground"
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
                            ref={(node) => {
                              messageRefs.current[message.id] = node;
                            }}
                            className="whitespace-nowrap text-sm text-foreground"
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
      </div>

      <QuickMessagesModals
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
        messageModalOpen={messageModalOpen}
        setMessageModalOpen={setMessageModalOpen}
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        historyMessages={historyMessages}
      />
    </motion.div>
  );
};
