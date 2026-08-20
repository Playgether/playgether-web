"use client";

import { useState } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { cn } from "@/lib/utils";
import { uploadFeedbackAttachment } from "@/lib/uploadFeedbackAttachment";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";

const MAX_CHARS = 1000;
const MIN_CHARS = 10;
const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_REPORT_VIDEO_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
];

const CONTACT_CATEGORIES = [
  { value: "conta", label: "Conta, acesso e dados pessoais" },
  { value: "seguranca", label: "Segurança e denúncias de abuso" },
  { value: "parcerias", label: "Parcerias e oportunidades" },
  { value: "outro", label: "Outro assunto" },
] as const;

const REPORT_SUBCATEGORIES = [
  { value: "insulto_assedio", label: "Insulto / assédio" },
  { value: "odio_discriminacao", label: "Discurso de ódio / discriminação" },
  { value: "conteudo_sexual", label: "Conteúdo sexual explícito" },
  { value: "spam_golpe", label: "Spam / golpe" },
  { value: "ameaca_violencia", label: "Ameaça / violência" },
  { value: "outro", label: "Outro" },
] as const;

export default function ContactSettingsPage() {
  const [category, setCategory] = useState<string>("conta");
  const [reportSubcategory, setReportSubcategory] = useState<string>("insulto_assedio");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);

  const channelLabel = category === "parcerias" ? "Canal Contato" : "Canal Suporte";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (message.trim().length < MIN_CHARS) {
      setError(`Escreva pelo menos ${MIN_CHARS} caracteres.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const attachmentUrls: string[] = [];
      for (const file of attachments) {
        setUploadingLabel(`Enviando ${file.name}…`);
        attachmentUrls.push(await uploadFeedbackAttachment(file));
      }
      setUploadingLabel(null);

      const res = await fetch("/api/contact", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          report_subcategory: category === "seguranca" ? reportSubcategory : undefined,
          subject: subject.trim(),
          message: message.trim(),
          attachments: attachmentUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar mensagem.");
        return;
      }
      CustomToast.success("Mensagem enviada! Nosso time vai te responder por e-mail.");
      setSubject("");
      setMessage("");
      setAttachments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha de conexão. Tente novamente.");
    } finally {
      setUploadingLabel(null);
      setLoading(false);
    }
  }

  return (
    <SettingsPageWrapper
      title="Ajuda e contato"
      description="Fale com a Playgether sobre conta, segurança ou parcerias. Bugs e sugestões de produto vão no Feedback da barra lateral."
    >
      <SettingsSection
        title="Enviar mensagem"
        description="Escolha o motivo e descreva o que você precisa. Assim direcionamos sua mensagem para o time certo."
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-muted/50 p-4 sm:p-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="contact-category">Motivo</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                if (value !== "seguranca") {
                  setReportSubcategory("insulto_assedio");
                }
              }}
            >
              <SelectTrigger
                id="contact-category"
                className="bg-background/50 border-border/50"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_CATEGORIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{channelLabel}</p>
          </div>

          {category === "seguranca" ? (
            <div className="space-y-1.5">
              <Label htmlFor="contact-report-subcategory">Tipo de denúncia</Label>
              <Select value={reportSubcategory} onValueChange={setReportSubcategory}>
                <SelectTrigger
                  id="contact-report-subcategory"
                  className="bg-background/50 border-border/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_SUBCATEGORIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Isso ajuda a triagem inicial do time de suporte.
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="contact-subject">Assunto</Label>
            <Input
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, 120))}
              placeholder="Resumo curto: o que aconteceu e onde"
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Mensagem</Label>
            <Textarea
              id="contact-message"
              placeholder="Descreva com detalhes…"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value.slice(0, MAX_CHARS));
                if (error) setError(null);
              }}
              rows={6}
              className="resize-none bg-background/50 border-border/50"
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
            <Label htmlFor="contact-attachments">Anexos</Label>
            <input
              id="contact-attachments"
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
                    file.type === "video/mp4" && category === "seguranca"
                      ? file.size > MAX_REPORT_VIDEO_FILE_SIZE_BYTES
                      : file.size > MAX_FILE_SIZE_BYTES,
                );
                if (hasLargeFile) {
                  setAttachments([]);
                  setAttachmentsError(
                    category === "seguranca"
                      ? "Imagens/PDF até 8 MB por arquivo; MP4 até 15 MB em denúncias."
                      : "Cada arquivo pode ter no máximo 8 MB.",
                  );
                  return;
                }

                setAttachmentsError(null);
                setAttachments(files);
              }}
            />
            <Button asChild variant="outline" type="button" className="w-full justify-start gap-2">
              <label htmlFor="contact-attachments" className="cursor-pointer">
                <Paperclip className="h-4 w-4" />
                Anexar arquivos
              </label>
            </Button>
            <p className="text-xs text-muted-foreground">
              {category === "seguranca"
                ? "Opcional. Até 3 arquivos (JPG, PNG, WEBP, PDF ou MP4). Imagens/PDF até 8 MB; MP4 até 15 MB em denúncias."
                : "Opcional. Até 3 arquivos (JPG, PNG, WEBP, PDF ou MP4), até 8 MB por arquivo."}
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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={loading} className="rounded-xl gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingLabel ?? "Enviando…"}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </SettingsSection>
      <CustomToaster />
    </SettingsPageWrapper>
  );
}
