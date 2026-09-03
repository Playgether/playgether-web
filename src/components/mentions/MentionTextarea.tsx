"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { cn } from "@/lib/utils";
import {
  getActiveMention,
  insertMention,
  type MentionSuggestion,
} from "@/lib/mentions";
import { getTextareaCaretCoordinates } from "@/lib/textareaCaret";

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

type MentionTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  dropdownSide?: "top" | "bottom";
  /** Grows with content (Shift+Enter / wrapping) up to maxGrowHeightPx. */
  autoGrow?: boolean;
  maxGrowHeightPx?: number;
};

export const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
  function MentionTextarea(
    {
      value,
      onChange,
      onKeyDown,
      dropdownSide = "bottom",
      className,
      autoGrow = false,
      maxGrowHeightPx = 140,
      ...props
    },
    ref,
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const listId = useId();
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
    const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
    const query = mention?.query ?? null;

    const updateDropdownPosition = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;

      const caret = el.selectionStart ?? el.value.length;
      const active = getActiveMention(el.value, caret);
      if (!active) return;

      const coords = getTextareaCaretCoordinates(el, caret);
      const textareaRect = el.getBoundingClientRect();

      setDropdownPosition({
        left: textareaRect.left,
        width: textareaRect.width,
        top: coords.top + coords.lineHeight + 4,
      });
    }, []);

    useEffect(() => {
      if (query == null) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `/api/users/mention-suggestions?q=${encodeURIComponent(query)}`,
            { credentials: "include", signal: controller.signal },
          );
          if (!res.ok) {
            setSuggestions([]);
            return;
          }
          const data = (await res.json()) as MentionSuggestion[];
          setSuggestions(Array.isArray(data) ? data : []);
          setActiveIndex(0);
        } catch (error) {
          if ((error as { name?: string }).name !== "AbortError") {
            setSuggestions([]);
          }
        } finally {
          setLoading(false);
        }
      }, 180);

      return () => {
        controller.abort();
        window.clearTimeout(timeout);
      };
    }, [query]);

    const applyMention = useCallback(
      (username: string) => {
        const el = innerRef.current;
        const caret = el?.selectionStart ?? value.length;
        const active = mention ?? getActiveMention(value, caret);
        if (!active) return;
        const next = insertMention(value, caret, active.start, username);
        onChange(next.next);
        setMention(null);
        setSuggestions([]);
        requestAnimationFrame(() => {
          const node = innerRef.current;
          if (!node) return;
          node.focus();
          node.setSelectionRange(next.caret, next.caret);
        });
      },
      [mention, onChange, value],
    );

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const el = event.target;
      const nextValue = el.value;
      const caret = el.selectionStart ?? nextValue.length;
      onChange(nextValue);
      setMention(getActiveMention(nextValue, caret));
      requestAnimationFrame(updateDropdownPosition);
    };

    useEffect(() => {
      if (!autoGrow) return;
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "0px";
      el.style.height = `${Math.min(el.scrollHeight, maxGrowHeightPx)}px`;
      el.style.overflowY = el.scrollHeight > maxGrowHeightPx ? "auto" : "hidden";
    }, [autoGrow, maxGrowHeightPx, value]);

    const open = mention != null;

    useEffect(() => {
      if (!open) {
        setDropdownPosition(null);
        return;
      }

      updateDropdownPosition();
      const el = innerRef.current;

      const handleScroll = () => updateDropdownPosition();
      el?.addEventListener("scroll", handleScroll);
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);

      return () => {
        el?.removeEventListener("scroll", handleScroll);
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }, [open, updateDropdownPosition, value, mention]);

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (mention != null && (event.key === "Enter" || event.key === "Tab")) {
        if (suggestions.length > 0) {
          event.preventDefault();
          applyMention(suggestions[activeIndex]?.username);
          return;
        }
        if (loading) {
          event.preventDefault();
          return;
        }
      }
      if (open && suggestions.length > 0) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setActiveIndex((i) => (i + 1) % suggestions.length);
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setMention(null);
          return;
        }
      }
      onKeyDown?.(event);
    };

    return (
      <div className="relative min-w-0 w-full">
        <Textarea
          {...props}
          ref={innerRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={() => {
            const el = innerRef.current;
            if (!el) return;
            setMention(getActiveMention(value, el.selectionStart ?? value.length));
            updateDropdownPosition();
          }}
          onClick={() => {
            const el = innerRef.current;
            if (!el) return;
            setMention(getActiveMention(value, el.selectionStart ?? value.length));
            updateDropdownPosition();
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          className={cn(
            autoGrow && "min-h-0 overflow-hidden",
            className,
          )}
        />
        {open && dropdownPosition && typeof document !== "undefined"
          ? createPortal(
              <ul
                id={listId}
                role="listbox"
                style={{
                  position: "fixed",
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  top: dropdownPosition.top,
                  zIndex: 9999,
                }}
                className="max-h-64 overflow-auto rounded-xl border border-border/60 bg-popover p-1 shadow-lg"
              >
                {loading && suggestions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">Buscando…</li>
                ) : suggestions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    Nenhum usuário encontrado
                  </li>
                ) : (
                  suggestions.map((user, index) => (
                    <li key={user.id} role="option" aria-selected={index === activeIndex}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left",
                          index === activeIndex ? "bg-muted" : "hover:bg-muted/70",
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyMention(user.username)}
                      >
                        <ProfileAvatar
                          displayName={user.name}
                          username={user.username}
                          profilePhoto={user.profile_photo}
                          sizeClass="h-8 w-8"
                          fallbackTextClassName="text-xs"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            @{user.username}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>,
              document.body,
            )
          : null}
      </div>
    );
  },
);
