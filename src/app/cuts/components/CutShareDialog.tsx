"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CustomToast } from "@/components/ui/customSonner";
import { useE2ECrypto } from "@/context/E2ECryptoContext";
import { getConversations, startConversation, type DMConversation } from "@/services/directMessages";
import { encodeSharedCut } from "@/lib/sharedContent";
import { Cut } from "@/types/Cut";
import { cn } from "@/lib/utils";
import { CutDMSender, type EncryptedDMPayload } from "./CutDMSender";

interface SearchUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  public_key: string | null;
}

interface ShareTarget {
  userId: string;
  label: string;
  username: string;
  conversationId: string | null;
  publicKey: string | null;
}

interface CutShareDialogProps {
  cut: Cut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CutShareDialog({ cut, open, onOpenChange }: CutShareDialogProps) {
  const { isReady, encryptForUser } = useE2ECrypto();
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Map<string, ShareTarget>>(new Map());
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [queue, setQueue] = useState<{ conversationId: string; payload: EncryptedDMPayload }[]>([]);
  const [activeSend, setActiveSend] = useState<{ conversationId: string; payload: EncryptedDMPayload } | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(new Map());
    setSearch("");
    setSearchResults([]);
    setProgress({ done: 0, total: 0 });
    setQueue([]);
    setActiveSend(null);
    setLoadingConversations(true);
    getConversations()
      .then((data) => setConversations(data.filter((c) => c.type === "private")))
      .finally(() => setLoadingConversations(false));
  }, [open]);

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?search=${encodeURIComponent(q)}`, { credentials: "include" });
        const json = await res.json();
        const data: SearchUser[] = Array.isArray(json) ? json : (json?.results ?? []);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const conversationTargets: ShareTarget[] = useMemo(
    () =>
      conversations
        .filter((c) => c.other_participant)
        .map((c) => ({
          userId: c.other_participant!.id,
          label: `${c.other_participant!.first_name} ${c.other_participant!.last_name}`.trim() || c.other_participant!.username,
          username: c.other_participant!.username,
          conversationId: c.id,
          publicKey: c.other_participant!.public_key,
        })),
    [conversations],
  );

  const searchTargets: ShareTarget[] = useMemo(
    () =>
      searchResults
        .filter((u) => !conversationTargets.some((t) => t.userId === u.id))
        .map((u) => ({
          userId: u.id,
          label: `${u.first_name} ${u.last_name}`.trim() || u.username,
          username: u.username,
          conversationId: null,
          publicKey: u.public_key,
        })),
    [searchResults, conversationTargets],
  );

  const toggleTarget = useCallback((target: ShareTarget) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(target.userId)) next.delete(target.userId);
      else next.set(target.userId, target);
      return next;
    });
  }, []);

  const handleConfirmSend = useCallback(async () => {
    if (selected.size === 0 || sending || !isReady) return;
    setSending(true);
    const jobs: { conversationId: string; payload: EncryptedDMPayload }[] = [];

    for (const target of selected.values()) {
      let conversationId = target.conversationId;
      let publicKey = target.publicKey;

      if (!conversationId) {
        const conv = await startConversation(target.userId);
        if (!conv) continue;
        conversationId = conv.id;
        publicKey = conv.other_participant?.public_key ?? publicKey;
      }
      if (!publicKey) continue;

      const plaintext = encodeSharedCut(cut);
      const encrypted = await encryptForUser(plaintext, publicKey);
      if (!encrypted) continue;

      jobs.push({
        conversationId,
        payload: {
          encrypted_body: encrypted.encryptedBody,
          encrypted_key_recipient: encrypted.encryptedKeyRecipient,
          encrypted_key_sender: encrypted.encryptedKeySender,
          iv: encrypted.iv,
        },
      });
    }

    if (jobs.length === 0) {
      setSending(false);
      CustomToast.error("Não foi possível preparar o envio.");
      return;
    }

    setProgress({ done: 0, total: jobs.length });
    setQueue(jobs);
  }, [selected, sending, isReady, cut, encryptForUser]);

  useEffect(() => {
    if (!sending) return;
    if (!activeSend && queue.length > 0) {
      const [next, ...rest] = queue;
      setActiveSend(next);
      setQueue(rest);
    } else if (!activeSend && queue.length === 0 && progress.total > 0 && progress.done === progress.total) {
      setSending(false);
      CustomToast.success(
        progress.total === 1 ? "Cut enviado!" : `Cut enviado para ${progress.total} pessoas!`,
      );
      onOpenChange(false);
    }
  }, [sending, activeSend, queue, progress, onOpenChange]);

  const handleSendDone = useCallback(() => {
    setProgress((p) => ({ ...p, done: p.done + 1 }));
    setActiveSend(null);
  }, []);

  const rows = search.trim() ? searchTargets : conversationTargets;

  return (
    <Dialog open={open} onOpenChange={(next) => !sending && onOpenChange(next)}>
      <DialogContent className="max-w-md border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Enviar cut</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por username..."
            className="pl-9"
          />
        </div>

        <div className="max-h-72 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : searching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search.trim() ? "Nenhum usuário encontrado." : "Nenhuma conversa recente."}
            </p>
          ) : (
            rows.map((target) => {
              const isSelected = selected.has(target.userId);
              return (
                <button
                  key={target.userId}
                  type="button"
                  onClick={() => toggleTarget(target)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-sm font-bold text-white">
                    {target.label[0]?.toUpperCase() ?? "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{target.label}</p>
                    <p className="truncate text-xs text-muted-foreground">@{target.username}</p>
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      isSelected ? "border-primary bg-primary" : "border-border/60",
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirmSend}
          disabled={selected.size === 0 || sending || !isReady}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors disabled:opacity-40 hover:bg-primary/90"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando {progress.done}/{progress.total}...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar{selected.size > 0 ? ` (${selected.size})` : ""}
            </>
          )}
        </button>

        {activeSend && (
          <CutDMSender
            conversationId={activeSend.conversationId}
            payload={activeSend.payload}
            onDone={handleSendDone}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
