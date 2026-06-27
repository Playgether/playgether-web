import { Send, Smile } from "lucide-react";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CHAT_EMOJI_CATEGORIES, searchChatEmojis } from "@/lib/chatEmojis";
import { cn } from "@/lib/utils";

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

// ── InputMessage ──────────────────────────────────────────────────────────────

const InputMessage = forwardRef<
  HTMLTextAreaElement,
  {
    messageInput: string;
    onInput: (value: string) => void;
    onSend?: () => void;
    disabled?: boolean;
  }
>(function InputMessage({ messageInput, onInput, onSend, disabled }, ref) {
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
    <div className="p-4 border-t border-border/50">
      <div className="flex items-end space-x-2">
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen} modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 mb-0.5"
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
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-muted/20 border border-border/50 rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />

        <Button
          size="icon"
          className="bg-gradient-primary hover:shadow-glow-primary/30 shrink-0 mb-0.5"
          onClick={handleSend}
          disabled={disabled || !messageInput.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

export default InputMessage;
