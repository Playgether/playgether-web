"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_CHARS = 1000;

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [category, setCategory] = useState("sugestao");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSent(false);
      setError(null);
      setMessage("");
      setCategory("sugestao");
    }
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (message.trim().length < 10) {
      setError("Escreva pelo menos 10 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar feedback.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
              <Send className="h-5 w-5 text-emerald-500" />
            </div>
            <DialogTitle>Feedback enviado!</DialogTitle>
            <DialogDescription>
              Obrigado pela sua contribuição. Sua mensagem já está com o time da
              Playgether.
            </DialogDescription>
            <Button className="mt-2" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enviar Feedback</DialogTitle>
              <DialogDescription>
                Nos conte o que achou, reporte um bug ou compartilhe uma ideia.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-1">
              <div className="space-y-1.5">
                <Label htmlFor="fb-category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="fb-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sugestao">💡 Sugestão</SelectItem>
                    <SelectItem value="bug">🐛 Bug / Problema</SelectItem>
                    <SelectItem value="elogio">⭐ Elogio</SelectItem>
                    <SelectItem value="outro">💬 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-message">Mensagem</Label>
                <Textarea
                  id="fb-message"
                  placeholder="Descreva com detalhes…"
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value.slice(0, MAX_CHARS))
                  }
                  rows={5}
                  className="resize-none"
                />
                <p
                  className={cn(
                    "text-right text-xs",
                    message.length >= MAX_CHARS
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {message.length}/{MAX_CHARS}
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button variant="ghost" disabled={loading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enviar"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
