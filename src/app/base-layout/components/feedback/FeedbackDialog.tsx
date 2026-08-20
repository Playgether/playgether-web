"use client";

import { useState } from "react";
import { Send, Loader2, Paperclip } from "lucide-react";
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
import { uploadFeedbackAttachment } from "@/lib/uploadFeedbackAttachment";

const MAX_CHARS = 1000;
const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
];

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [category, setCategory] = useState("sugestao");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSent(false);
      setError(null);
      setMessage("");
      setAttachments([]);
      setAttachmentsError(null);
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
      const attachmentUrls: string[] = [];
      for (const file of attachments) {
        setUploadingLabel(`Enviando ${file.name}…`);
        attachmentUrls.push(await uploadFeedbackAttachment(file));
      }
      setUploadingLabel(null);

      const res = await fetch("/api/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          attachments: attachmentUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar feedback.");
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha de conexão. Tente novamente.");
    } finally {
      setUploadingLabel(null);
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

              <div className="space-y-1.5">
                <Label htmlFor="fb-attachments">Anexos</Label>
                <input
                  id="fb-attachments"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > MAX_ATTACHMENTS) {
                      setAttachments([]);
                      setAttachmentsError(`Selecione no máximo ${MAX_ATTACHMENTS} arquivos.`);
                      return;
                    }

                    const hasInvalidType = files.some(
                      (file) => !ALLOWED_ATTACHMENT_TYPES.includes(file.type),
                    );
                    if (hasInvalidType) {
                      setAttachments([]);
                      setAttachmentsError("Formatos aceitos: JPG, PNG, WEBP, PDF e MP4.");
                      return;
                    }

                    const hasLargeFile = files.some(
                      (file) =>
                        file.type === "video/mp4"
                          ? file.size > MAX_VIDEO_FILE_SIZE_BYTES
                          : file.size > MAX_FILE_SIZE_BYTES,
                    );
                    if (hasLargeFile) {
                      setAttachments([]);
                      setAttachmentsError(
                        "Imagens/PDF até 8 MB por arquivo; MP4 até 25 MB.",
                      );
                      return;
                    }

                    setAttachmentsError(null);
                    setAttachments(files);
                  }}
                />
                <Button asChild variant="outline" type="button" className="w-full justify-start gap-2">
                  <label htmlFor="fb-attachments" className="cursor-pointer">
                    <Paperclip className="h-4 w-4" />
                    Anexar arquivos
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Opcional. Até 3 arquivos (JPG, PNG, WEBP, PDF ou MP4). Imagens/PDF até 8 MB; MP4 até 25 MB.
                </p>
                {attachmentsError ? (
                  <p className="text-xs text-destructive">{attachmentsError}</p>
                ) : null}
                {attachments.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {attachments.length} arquivo(s) selecionado(s):{" "}
                    {attachments.map((file) => file.name).join(", ")}
                  </p>
                ) : null}
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
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadingLabel ?? "Enviando…"}
                  </span>
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
