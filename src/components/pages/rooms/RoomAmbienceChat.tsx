"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import {
  CHAT_EMOJI_CATEGORIES,
  searchChatEmojis,
} from "@/lib/chatEmojis";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextareaAutosize from "react-textarea-autosize";
import type { RoomAmbienceMessage } from "@/types/RoomAmbience";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Pin,
  PinOff,
  Reply,
  Send,
  Smile,
  X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function ambienceMessageIsSystem(m: RoomAmbienceMessage): boolean {
  return Boolean(m.is_system || m.author_user_id === 0);
}

function ReplyQuote({
  username,
  body,
  float,
}: {
  username: string;
  body: string;
  float?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-1.5 rounded-md border-l-2 px-2 py-1 text-xs",
        float
          ? "border-primary/70 bg-white/5 text-zinc-300"
          : "border-primary/50 bg-muted/40 text-muted-foreground",
      )}
    >
      <p className={cn("font-semibold", float ? "text-zinc-200" : "text-foreground")}>
        {username}
      </p>
      <p className="line-clamp-3 whitespace-pre-wrap opacity-90">{body}</p>
    </div>
  );
}

export const AmbienceChatLine = memo(function AmbienceChatLine({
  m,
  variant = "sidebar",
  amHost,
  isPinned,
  onReply,
  onPin,
  onUnpin,
}: {
  m: RoomAmbienceMessage;
  variant?: "sidebar" | "float";
  amHost?: boolean;
  isPinned?: boolean;
  onReply?: (m: RoomAmbienceMessage) => void;
  onPin?: (m: RoomAmbienceMessage) => void;
  onUnpin?: () => void;
}) {
  const float = variant === "float";
  const motion = !float
    ? "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
    : "";
  const isSystem = ambienceMessageIsSystem(m);
  const canInteract = !isSystem && onReply;

  if (isSystem) {
    return (
      <div
        className={cn(
          "max-w-[95%] rounded-2xl border px-3 py-2 text-sm shadow-sm [contain:content]",
          motion,
          float
            ? "border-white/25 bg-black text-zinc-100 shadow-black/40"
            : "border-border/60 bg-muted/50 text-muted-foreground",
        )}
      >
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            float ? "text-zinc-400" : "text-muted-foreground",
          )}
        >
          Sistema
        </p>
        <p className={cn("whitespace-pre-wrap", float ? "text-zinc-50" : "text-foreground")}>
          {m.body}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex gap-2 rounded-lg border px-2 py-2 [contain:content]",
        motion,
        isPinned && !float && "ring-1 ring-primary/40",
        float
          ? "border-white/20 bg-black text-zinc-50 shadow-sm shadow-black/40 ring-1 ring-white/5"
          : "border-border/40 bg-muted/20 text-foreground",
      )}
    >
      <ProfileAvatar
        displayName={m.author_username}
        username={m.author_username}
        profilePhoto={m.author_photo}
        sizeClass="h-8 w-8"
        fallbackTextClassName="text-[10px]"
        className={cn("mt-0.5 shrink-0 ring-1", float ? "ring-white/25" : "ring-border")}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={cn("text-[11px] font-semibold", float ? "text-zinc-100" : "text-foreground")}>
            {m.author_username}
          </p>
          {isPinned ? (
            <Pin className={cn("h-3 w-3 shrink-0", float ? "text-primary" : "text-primary")} />
          ) : null}
        </div>
        {m.reply_to_id && m.reply_to_username && m.reply_to_body ? (
          <ReplyQuote
            username={m.reply_to_username}
            body={m.reply_to_body}
            float={float}
          />
        ) : null}
        <p className={cn("text-sm whitespace-pre-wrap", float ? "text-zinc-50" : "text-foreground")}>
          {m.body}
        </p>
      </div>
      {canInteract ? (
        <div
          className={cn(
            "absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100",
            float && "opacity-100",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7",
              float ? "text-zinc-300 hover:bg-white/10 hover:text-white" : "",
            )}
            title="Responder"
            onClick={() => onReply(m)}
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>
          {amHost && onPin ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7",
                float ? "text-zinc-300 hover:bg-white/10 hover:text-white" : "",
              )}
              title={isPinned ? "Desafixar" : "Fixar mensagem"}
              onClick={() => (isPinned && onUnpin ? onUnpin() : onPin(m))}
            >
              {isPinned ? (
                <PinOff className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

export function AmbiencePinnedBanner({
  message,
  float,
  amHost,
  onUnpin,
}: {
  message: RoomAmbienceMessage;
  float?: boolean;
  amHost?: boolean;
  onUnpin?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setExpanded(true);
  }, [message.id]);

  const shellClass = cn(
    "shrink-0 border-b transition-[padding] duration-200",
    expanded ? "px-3 py-2" : "px-2 py-1",
    float
      ? "border-primary/30 bg-primary/15 text-zinc-50"
      : "border-primary/25 bg-primary/10",
  );

  if (!expanded) {
    return (
      <div className={shellClass}>
        <div className="flex items-center gap-2">
          <Pin className="h-3 w-3 shrink-0 text-primary" />
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              float ? "text-zinc-200" : "text-muted-foreground",
            )}
          >
            <span className="font-semibold text-foreground">{message.author_username}: </span>
            {message.body}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0",
              float ? "text-zinc-300 hover:bg-white/10" : "text-muted-foreground",
            )}
            title="Expandir mensagem fixada"
            onClick={() => setExpanded(true)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wide",
              float ? "text-primary" : "text-primary",
            )}
          >
            Mensagem fixada
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6",
              float ? "text-zinc-300 hover:bg-white/10" : "text-muted-foreground",
            )}
            title="Minimizar"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          {amHost && onUnpin ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                float ? "text-zinc-300 hover:bg-white/10" : "",
              )}
              title="Desafixar"
              onClick={onUnpin}
            >
              <PinOff className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      </div>
      <p
        className={cn(
          "mt-1 whitespace-pre-wrap text-xs leading-relaxed",
          float ? "text-zinc-100" : "text-foreground",
        )}
      >
        <span className="font-semibold">{message.author_username}: </span>
        {message.body}
      </p>
    </div>
  );
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

function AmbienceEmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
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
                Nenhum resultado. Tente &quot;vinho&quot;, &quot;bebida&quot;, &quot;feliz&quot;…
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
                aria-label={cat.label}
                title={cat.label}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md text-lg leading-none transition-[filter,opacity,background]",
                  activeTab === cat.id
                    ? "bg-muted opacity-100 grayscale-0"
                    : "bg-transparent opacity-50 grayscale hover:bg-muted/60 hover:opacity-70",
                )}
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

export function AmbienceChatEmptyState({ float }: { float?: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-2 py-4 text-center">
      <div
        className={cn(
          "flex items-center justify-center rounded-full text-primary",
          float ? "h-11 w-11 bg-primary/15" : "h-12 w-12 bg-primary/10",
        )}
      >
        <MessageSquare className={float ? "h-5 w-5" : "h-6 w-6"} />
      </div>
      <p className={cn("text-sm font-semibold", float ? "text-zinc-50" : "text-foreground")}>
        Nenhuma mensagem ainda
      </p>
      <p
        className={cn(
          "text-xs leading-snug",
          float ? "text-zinc-400" : "text-muted-foreground",
        )}
      >
        Quebra o gelo! Envie a primeira mensagem para começar a conversa.
      </p>
    </div>
  );
}

export function AmbienceChatInput({
  value,
  onChange,
  onSend,
  replyTo,
  onCancelReply,
  float,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  replyTo: RoomAmbienceMessage | null;
  onCancelReply: () => void;
  float?: boolean;
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textSelectionRef = useRef({ start: 0, end: 0 });

  const syncTextSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    textSelectionRef.current = {
      start: el.selectionStart ?? value.length,
      end: el.selectionEnd ?? value.length,
    };
  }, [value.length]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      const { start, end } = textSelectionRef.current;
      const next = value.slice(0, start) + emoji + value.slice(end);
      const pos = start + emoji.length;
      textSelectionRef.current = { start: pos, end: pos };
      onChange(next);
      // Não focar o textarea aqui — o Radix fecha o popover em onFocusOutside.
    },
    [onChange, value],
  );

  useEffect(() => {
    if (emojiOpen) syncTextSelection();
  }, [emojiOpen, syncTextSelection]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const textareaClass = float
    ? "min-w-0 flex-1 resize-none rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-primary/60 focus:outline-none"
    : "min-w-0 flex-1 resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm";

  const emojiBtnClass = float
    ? "shrink-0 border border-white/15 bg-black text-zinc-100 hover:bg-white/10 hover:text-white"
    : "shrink-0";

  const sendBtnClass = float
    ? "shrink-0 border border-white/15 bg-black text-zinc-100 hover:bg-white/10 hover:text-white"
    : "";

  return (
    <div className={cn("shrink-0", float ? "border-t border-white/10 bg-black p-2" : "flex flex-col gap-2 border-t border-border/60 p-2")}>
      {replyTo ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs",
            float
              ? "border-white/15 bg-white/5 text-zinc-300"
              : "border-border/60 bg-muted/30",
          )}
        >
          <Reply className="h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Respondendo a {replyTo.author_username}</p>
            <p className="line-clamp-3 whitespace-pre-wrap opacity-80">{replyTo.body}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 shrink-0", float && "text-zinc-300 hover:bg-white/10")}
            onClick={onCancelReply}
            aria-label="Cancelar resposta"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen} modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(emojiBtnClass, "mb-0.5 shrink-0")}
              title="Emojis"
              aria-label="Abrir emojis"
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
            <AmbienceEmojiPicker onPick={insertEmoji} />
          </PopoverContent>
        </Popover>
        <TextareaAutosize
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={syncTextSelection}
          onClick={syncTextSelection}
          onKeyUp={syncTextSelection}
          onFocus={syncTextSelection}
          className={textareaClass}
          placeholder={replyTo ? "Sua resposta…" : "Comentar…"}
          minRows={1}
          maxRows={6}
          onKeyDown={handleKeyDown}
          aria-label="Mensagem do chat"
        />
        <Button
          size="icon"
          className={cn(sendBtnClass, "mb-0.5 shrink-0")}
          onClick={onSend}
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

