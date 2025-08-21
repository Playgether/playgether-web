import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

export default function InputMessage({
  messageInput,
  onInput,
}: {
  messageInput: string;
  onInput: (value: string) => void;
}) {
  return (
    <div className="p-4 border-t border-border/50">
      <div className="flex space-x-3">
        <Input
          value={messageInput}
          onChange={(e) => onInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-muted/20 border-border/50"
          onKeyDown={(e) => e.key === "Enter" && onInput("")}
        />
        <Button
          size="icon"
          className="bg-gradient-primary hover:shadow-glow-primary/30"
          onClick={() => onInput("")}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
