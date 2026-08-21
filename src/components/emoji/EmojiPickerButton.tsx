"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CHAT_EMOJI_CATEGORIES, searchChatEmojis } from "@/lib/chatEmojis";
import { cn } from "@/lib/utils";

/** Dialog scroll-lock swallows wheel on portaled popovers — scroll the list ourselves. */
function onEmojiListWheel(e: ReactWheelEvent<HTMLDivElement>) {
  e.stopPropagation();
  const el = e.currentTarget;
  const { scrollTop, scrollHeight, clientHeight } = el;
  const canScrollUp = scrollTop > 0 && e.deltaY < 0;
  const canScrollDown = scrollTop + clientHeight < scrollHeight && e.deltaY > 0;
  if (!canScrollUp && !canScrollDown) return;
  el.scrollTop += e.deltaY;
  e.preventDefault();
}

function EmojiGrid({
  emojis,
  onPick,
}: {
  emojis: readonly string[];
  onPick: (emoji: string) => void;
}) {
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

export function EmojiPickerPanel({
  onPick,
  className,
}: {
  onPick: (emoji: string) => void;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(CHAT_EMOJI_CATEGORIES[0]?.id ?? "faces");
  const [search, setSearch] = useState("");

  const searchResults = useMemo(() => searchChatEmojis(search), [search]);
  const isSearching = search.trim().length > 0;

  const activeCategory = useMemo(
    () => CHAT_EMOJI_CATEGORIES.find((c) => c.id === activeTab) ?? CHAT_EMOJI_CATEGORIES[0],
    [activeTab],
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden bg-popover text-popover-foreground",
        className,
      )}
    >
      <div className="shrink-0 border-b border-border/60 p-2">
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
        <div
          className="h-36 overflow-y-auto overscroll-contain p-2"
          onWheelCapture={onEmojiListWheel}
        >
          {searchResults.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              Nenhum resultado.
            </p>
          ) : (
            <EmojiGrid emojis={searchResults} onPick={onPick} />
          )}
        </div>
      ) : (
        <>
          <div
            className="grid shrink-0 grid-cols-6 gap-0.5 border-b border-border/60 p-1.5"
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
          <div
            className="h-36 overflow-y-auto overscroll-contain p-2"
            role="tabpanel"
            onWheelCapture={onEmojiListWheel}
          >
            <EmojiGrid emojis={activeCategory?.emojis ?? []} onPick={onPick} />
          </div>
        </>
      )}
    </div>
  );
}

export function useEmojiInsert(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (next: string) => void,
  maxLength?: number,
) {
  const selectionRef = useRef({ start: value.length, end: value.length });

  const syncSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    selectionRef.current = {
      start: el.selectionStart ?? value.length,
      end: el.selectionEnd ?? value.length,
    };
  }, [textareaRef, value.length]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      const el = textareaRef.current;
      const live = el != null && document.activeElement === el;
      const start = live
        ? (el.selectionStart ?? selectionRef.current.start)
        : selectionRef.current.start;
      const end = live
        ? (el.selectionEnd ?? selectionRef.current.end)
        : selectionRef.current.end;
      let next = value.slice(0, start) + emoji + value.slice(end);
      if (typeof maxLength === "number" && next.length > maxLength) {
        next = next.slice(0, maxLength);
      }
      const pos = Math.min(start + emoji.length, next.length);
      selectionRef.current = { start: pos, end: pos };
      onChange(next);
      requestAnimationFrame(() => {
        const node = textareaRef.current;
        if (!node) return;
        node.focus();
        node.setSelectionRange(pos, pos);
      });
    },
    [maxLength, onChange, textareaRef, value],
  );

  const restoreFocus = useCallback(() => {
    const node = textareaRef.current;
    if (!node) return;
    const { start, end } = selectionRef.current;
    node.focus();
    node.setSelectionRange(start, end);
  }, [textareaRef]);

  return { insertEmoji, syncSelection, restoreFocus };
}

type EmojiPickerButtonProps = {
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  /** Extra classes for the picker surface (e.g. dark cut comments). */
  panelClassName?: string;
  size?: "default" | "sm" | "icon";
  variant?: "ghost" | "outline" | "secondary";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeforeOpen?: () => void;
  onPick: (emoji: string) => void;
  /** Called after the popover closes (e.g. restore textarea caret). */
  onClosed?: () => void;
};

/** Smile toggle — YouTube-style popover anchored below the button. */
export function EmojiPickerButton({
  disabled,
  className,
  buttonClassName,
  panelClassName,
  size = "icon",
  variant = "ghost",
  open,
  onOpenChange,
  onBeforeOpen,
  onPick,
  onClosed,
}: EmojiPickerButtonProps) {
  return (
    <Popover
      modal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) onClosed?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={disabled}
          className={cn("shrink-0 text-muted-foreground hover:text-primary", buttonClassName)}
          title="Emojis"
          aria-label="Abrir emojis"
          aria-expanded={open}
          aria-haspopup="dialog"
          onMouseDown={() => {
            onBeforeOpen?.();
          }}
        >
          <Smile className={cn("h-4 w-4", className)} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        avoidCollisions
        collisionPadding={12}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onWheelCapture={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="z-[70] w-[min(calc(100vw-1.5rem),18rem)] overflow-hidden rounded-xl border border-border/60 p-0 shadow-lg"
      >
        <EmojiPickerPanel onPick={onPick} className={panelClassName} />
      </PopoverContent>
    </Popover>
  );
}
