"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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

const MAX_CHARS = 1000;
const MIN_CHARS = 10;

const CONTACT_CATEGORIES = [
  { value: "conta", label: "Conta e dados pessoais" },
  { value: "parcerias", label: "Parcerias" },
  { value: "imprensa", label: "Imprensa" },
  { value: "juridico", label: "Jurídico" },
  { value: "outro", label: "Outro" },
] as const;

export default function ContactSettingsPage() {
  const [category, setCategory] = useState<string>("conta");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (message.trim().length < MIN_CHARS) {
      setError(`Escreva pelo menos ${MIN_CHARS} caracteres.`);
      return;
    }
    setError(null);
    // Envio ainda não conectado ao backend.
  }

  return (
    <SettingsPageWrapper
      title="Ajuda e contato"
      description="Fale com a Playgether sobre conta, parcerias, imprensa ou assuntos jurídicos. Bugs e sugestões de produto vão no Feedback da barra lateral."
    >
      <SettingsSection
        title="Enviar mensagem"
        description="Escolha o motivo e descreva o que você precisa. Cada assunto segue para um canal diferente."
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-muted/50 p-4 sm:p-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="contact-category">Motivo</Label>
            <Select value={category} onValueChange={setCategory}>
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-subject">Assunto</Label>
            <Input
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, 120))}
              placeholder="Resumo do que você precisa"
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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end pt-1">
            <Button type="submit" className="rounded-xl gap-2">
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </div>
        </form>
      </SettingsSection>
    </SettingsPageWrapper>
  );
}
