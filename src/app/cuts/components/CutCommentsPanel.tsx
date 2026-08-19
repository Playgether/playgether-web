"use client";

import { useEffect, useState, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { Cut } from "@/types/Cut";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { MentionText } from "@/components/mentions/MentionText";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

interface CutComment {
  id: string;
  comment: string;
  user: number;
  timestamp: string;
  user_username?: string;
  created_by_user_photo?: string | null;
  highlighted_achievements?: HighlightedAchievementPublic[];
}

interface CutCommentsPanelProps {
  cut: Cut;
  isAuthenticated?: boolean;
  onClose: () => void;
  variant: "side" | "sheet";
}

export function CutCommentsPanel({ cut, isAuthenticated, onClose, variant }: CutCommentsPanelProps) {
  const [comments, setComments] = useState<CutComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/cuts/${cut.id}/comments`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cut.id]);

  async function handleSend() {
    if (!text.trim() || !isAuthenticated) return;
    setSending(true);
    try {
      const res = await fetch(`/api/cuts/${cut.id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setText("");
      }
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  }

  const body = (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        {variant === "sheet" ? (
          <DrawerTitle className="text-sm font-semibold text-white">
            Comentários · {cut.comments_count}
          </DrawerTitle>
        ) : (
          <span className="text-sm font-semibold text-white">
            Comentários · {cut.comments_count}
          </span>
        )}
        <button type="button" onClick={onClose} aria-label="Fechar">
          <X className="h-5 w-5 text-white/70 hover:text-white" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-white/40 pt-8">Nenhum comentário ainda.</p>
        ) : (
          comments.map((c) => <CommentRow key={c.id} comment={c} />)
        )}
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
          <MentionTextarea
            ref={inputRef}
            value={text}
            onChange={setText}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Adicionar comentário…"
            rows={1}
            dropdownSide="top"
            className="min-h-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 resize-none border-0"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            aria-label="Enviar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}
    </>
  );

  if (variant === "side") {
    return (
      <div className="flex h-full w-full flex-col border-l border-white/10 bg-zinc-950">
        {body}
      </div>
    );
  }

  return (
    <Drawer open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DrawerContent className="flex h-[80dvh] flex-col border-white/10 bg-zinc-950 text-white">
        {body}
      </DrawerContent>
    </Drawer>
  );
}

function CommentRow({ comment }: { comment: CutComment }) {
  const avatarSrc = comment.created_by_user_photo ? getCloudinaryUrl(comment.created_by_user_photo) : null;
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
        {avatarSrc ? (
          <Image src={avatarSrc} alt="" width={32} height={32} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
            {comment.user_username?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="shrink-0 text-xs font-semibold text-white/80">
            @{comment.user_username ?? "user"}
          </span>
          <HighlightedAchievementBadges
            achievements={comment.highlighted_achievements}
            className="max-w-full"
            compact
          />
        </div>
        <p className="text-sm text-white/90">
          <MentionText text={comment.comment} />
        </p>
      </div>
    </div>
  );
}
