import { Send } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

export default function InputMessage({
  messageInput,
  onInput,
  onSend,
  disabled,
}: {
  messageInput: string;
  onInput: (value: string) => void;
  onSend?: () => void;
  disabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!messageInput.trim() || disabled) return;
    onSend?.();
    // Resetar altura após envio
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInput(e.target.value);
    // Crescer com o conteúdo, máximo 5 linhas (~120px)
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter: comportamento padrão (nova linha)
  };

  return (
    <div className="p-4 border-t border-border/50">
      <div className="flex items-end space-x-3">
        <textarea
          ref={textareaRef}
          value={messageInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-muted/20 border border-border/50 rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />
        <Button
          size="icon"
          className="bg-gradient-primary hover:shadow-glow-primary/30 shrink-0"
          onClick={handleSend}
          disabled={disabled || !messageInput.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
