"use client";

import { Send, Smile, Megaphone, X, Swords } from "lucide-react";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CHAT_EMOJI_CATEGORIES, searchChatEmojis } from "@/lib/chatEmojis";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import type { MegaphoneReplyDraft } from "@/context/ConversationsWidgetContext";
import type { DuoReplyDraft } from "@/lib/duoFinderMessage";

// ── Emoji Picker ─────────────────────────────────────────────────────────────

function EmojiGrid({ emojis, onPick }: { emojis: readonly string[]; onPick: (e: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-0.5">
      {emojis.map((emoji, idx) => (
        <button
          key={`${emoji}-${idx}`}
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-muted"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function DMEmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [activeTab, setActiveTab] = useState(CHAT_EMOJI_CATEGORIES[0]?.id ?? "faces");
  const [search, setSearch] = useState("");

  const searchResults = useMemo(() => searchChatEmojis(search), [search]);
  const isSearching = search.trim().length > 0;

  const activeCategory = useMemo(
    () => CHAT_EMOJI_CATEGORIES.find((c) => c.id === activeTab) ?? CHAT_EMOJI_CATEGORIES[0],
    [activeTab],
  );

  return (
    <div className="flex w-72 flex-col">
      <div className="border-b border-border/60 p-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar emoji…"
          className="w-full rounded-md border border-border/70 bg-background px-2.5 py-1.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          aria-label="Buscar emoji"
        />
      </div>
      {isSearching ? (
        <ScrollArea className="h-44">
          <div className="p-2">
            {searchResults.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                Nenhum resultado.
              </p>
            ) : (
              <EmojiGrid emojis={searchResults} onPick={onPick} />
            )}
          </div>
        </ScrollArea>
      ) : (
        <>
          <div
            className="grid grid-cols-6 gap-0.5 border-b border-border/60 p-1.5"
            role="tablist"
            aria-label="Categorias de emoji"
          >
            {CHAT_EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeTab === cat.id}
                title={cat.label}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md text-lg leading-none transition-[filter,opacity,background]",
                  activeTab === cat.id
                    ? "bg-muted opacity-100 grayscale-0"
                    : "bg-transparent opacity-50 grayscale hover:bg-muted/60 hover:opacity-70",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveTab(cat.id)}
              >
                <span aria-hidden>{cat.tabIcon}</span>
              </button>
            ))}
          </div>
          <ScrollArea className="h-44">
            <div className="p-2" role="tabpanel">
              <EmojiGrid emojis={activeCategory?.emojis ?? []} onPick={onPick} />
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

function MegaphoneReplyBanner({
  reply,
  onDismiss,
}: {
  reply: MegaphoneReplyDraft;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-secondary">
        <Megaphone className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <ProfileAvatar
            displayName={reply.authorName}
            username={reply.authorUsername}
            profilePhoto={reply.authorAvatar}
            sizeClass="h-5 w-5"
            fallbackTextClassName="text-[9px]"
          />
          <p className="truncate text-xs font-medium text-foreground">
            Respondendo ao alto-falante de @{reply.authorUsername}
          </p>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          “{reply.quote}”
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        aria-label="Cancelar resposta"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DuoReplyBanner({
  reply,
  onDismiss,
}: {
  reply: DuoReplyDraft;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-2 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-2.5 py-2">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-sm">
        <Swords className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <ProfileAvatar
            displayName={reply.partnerName}
            username={reply.partnerUsername}
            profilePhoto={reply.partnerAvatar}
            sizeClass="h-5 w-5"
            fallbackTextClassName="text-[9px]"
          />
          <p className="truncate text-xs font-medium text-foreground">
            Duo Finder · {reply.gameName}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {reply.matchPercent}% de compatibilidade com @{reply.partnerUsername}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        aria-label="Cancelar mensagem do duo"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── InputMessage ──────────────────────────────────────────────────────────────

const InputMessage = forwardRef<
  HTMLTextAreaElement,
  {
    messageInput: string;
    onInput: (value: string) => void;
    onSend?: () => void;
    disabled?: boolean;
    megaphoneReply?: MegaphoneReplyDraft | null;
    onDismissMegaphoneReply?: () => void;
    duoReply?: DuoReplyDraft | null;
    onDismissDuoReply?: () => void;
  }
>(function InputMessage(
  {
    messageInput,
    onInput,
    onSend,
    disabled,
    megaphoneReply,
    onDismissMegaphoneReply,
    duoReply,
    onDismissDuoReply,
  },
  ref
) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textSelectionRef = useRef({ start: 0, end: 0 });
  const [emojiOpen, setEmojiOpen] = useState(false);

  const getEl = () =>
    (ref as React.RefObject<HTMLTextAreaElement>)?.current ?? internalRef.current;

  const syncSelection = useCallback(() => {
    const el = getEl();
    if (!el) return;
    textSelectionRef.current = {
      start: el.selectionStart ?? messageInput.length,
      end: el.selectionEnd ?? messageInput.length,
    };
  }, [messageInput.length]);

  useEffect(() => {
    if (emojiOpen) syncSelection();
  }, [emojiOpen, syncSelection]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      const { start, end } = textSelectionRef.current;
      const next = messageInput.slice(0, start) + emoji + messageInput.slice(end);
      const pos = start + emoji.length;
      textSelectionRef.current = { start: pos, end: pos };
      onInput(next);
      const el = getEl();
      if (el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 120) + "px";
      }
    },
    [messageInput, onInput],
  );

  const handleSend = () => {
    if (!messageInput.trim() || disabled) return;
    onSend?.();
    const el = getEl();
    if (el) el.style.height = "auto";
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const mergeRef = (el: HTMLTextAreaElement | null) => {
    (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    if (typeof ref === "function") {
      ref(el);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    }
  };

  return (
    <div className="border-t border-border/50 p-3 sm:p-4">
      {duoReply ? (
        <DuoReplyBanner reply={duoReply} onDismiss={() => onDismissDuoReply?.()} />
      ) : megaphoneReply ? (
        <MegaphoneReplyBanner
          reply={megaphoneReply}
          onDismiss={() => onDismissMegaphoneReply?.()}
        />
      ) : null}
      <div className="flex items-end space-x-2">
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen} modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mb-0.5 shrink-0"
              title="Emojis"
              aria-label="Abrir emojis"
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            side="top"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onFocusOutside={(e) => e.preventDefault()}
          >
            <DMEmojiPicker onPick={insertEmoji} />
          </PopoverContent>
        </Popover>

        <textarea
          ref={mergeRef}
          value={messageInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={syncSelection}
          onClick={syncSelection}
          onKeyUp={syncSelection}
          onFocus={syncSelection}
          placeholder={
            duoReply
              ? "Escreva sua mensagem do duo..."
              : megaphoneReply
              ? "Escreva sua resposta..."
              : "Digite sua mensagem..."
          }
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none overflow-y-auto rounded-md border border-border/50 bg-muted/50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 scrollbar-none [&::-webkit-scrollbar]:hidden"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />

        <Button
          size="icon"
          className="mb-0.5 shrink-0 bg-gradient-primary hover:shadow-glow-primary/30"
          onClick={handleSend}
          disabled={disabled || !messageInput.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

export default InputMessage;
